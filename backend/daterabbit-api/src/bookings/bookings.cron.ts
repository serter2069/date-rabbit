import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull, Between } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { BookingsService } from './bookings.service';
import { PaymentsService } from '../payments/payments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class BookingsCron {
  private readonly logger = new Logger(BookingsCron.name);

  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    private bookingsService: BookingsService,
    private paymentsService: PaymentsService,
    private notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async expirePendingBookings(): Promise<void> {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Load bookings with seeker/companion so we can send notifications
    const expiredBookings = await this.bookingsRepository.find({
      where: {
        status: BookingStatus.PENDING,
        createdAt: LessThan(cutoff),
      },
      relations: ['seeker', 'companion'],
    });

    if (expiredBookings.length === 0) return;

    // Bulk-update status to CANCELLED
    await this.bookingsRepository.update(
      {
        status: BookingStatus.PENDING,
        createdAt: LessThan(cutoff),
      },
      {
        status: BookingStatus.CANCELLED,
        cancellationReason: 'expired: companion did not respond within 24 hours',
      },
    );

    this.logger.log(`[BookingsCron] Expired ${expiredBookings.length} pending bookings`);

    // Send push + email notifications for each expired booking
    for (const booking of expiredBookings) {
      await this.sendExpiryNotifications(booking).catch((err) => {
        this.logger.error(`Failed to send expiry notifications for booking ${booking.id}: ${err.message}`);
      });
    }
  }

  private async sendExpiryNotifications(booking: Booking): Promise<void> {
    const companionName = booking.companion?.name || 'your companion';
    const notifData = { bookingId: booking.id };

    // Notify seeker: request expired, companion did not respond
    await this.notificationsService.create({
      userId: booking.seekerId,
      type: NotificationType.BOOKING_EXPIRED,
      title: 'Booking request expired',
      body: `Your request to ${companionName} expired — they didn't respond in time. Try sending a request to another companion.`,
      data: notifData,
      pushToken: booking.seeker?.expoPushToken,
      notificationsEnabled: booking.seeker?.notificationsEnabled,
      notificationPreferences: booking.seeker?.notificationPreferences as Record<string, boolean> | null,
      recipientEmail: booking.seeker?.email,
    }).catch((err) => {
      this.logger.error(`Failed to notify seeker ${booking.seekerId} for expired booking ${booking.id}: ${err.message}`);
    });

    // Notify companion: missed a booking request
    await this.notificationsService.create({
      userId: booking.companionId,
      type: NotificationType.BOOKING_EXPIRED,
      title: 'You missed a booking request',
      body: `You missed a booking request — it expired before you responded. Check your availability settings to avoid missing future requests.`,
      data: notifData,
      pushToken: booking.companion?.expoPushToken,
      notificationsEnabled: booking.companion?.notificationsEnabled,
      notificationPreferences: booking.companion?.notificationPreferences as Record<string, boolean> | null,
      recipientEmail: booking.companion?.email,
    }).catch((err) => {
      this.logger.error(`Failed to notify companion ${booking.companionId} for expired booking ${booking.id}: ${err.message}`);
    });
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkNoShows() {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    // Find confirmed/paid bookings where dateTime was 15+ min ago and at least one party didn't check in
    const bookings = await this.bookingsRepository.find({
      where: [
        { status: BookingStatus.CONFIRMED, dateTime: LessThan(fifteenMinutesAgo), seekerCheckinAt: IsNull() },
        { status: BookingStatus.CONFIRMED, dateTime: LessThan(fifteenMinutesAgo), companionCheckinAt: IsNull() },
        { status: BookingStatus.PAID, dateTime: LessThan(fifteenMinutesAgo), seekerCheckinAt: IsNull() },
        { status: BookingStatus.PAID, dateTime: LessThan(fifteenMinutesAgo), companionCheckinAt: IsNull() },
      ],
      relations: ['seeker', 'companion'],
    });

    // Deduplicate: a booking may match multiple where conditions
    const seen = new Set<string>();
    const unique = bookings.filter(b => {
      if (seen.has(b.id)) return false;
      seen.add(b.id);
      return true;
    });

    for (const booking of unique) {
      const seekerNoShow = !booking.seekerCheckinAt;
      const companionNoShow = !booking.companionCheckinAt;

      // Determine who didn't show up
      let reason: 'seeker' | 'companion' | 'both';
      if (seekerNoShow && companionNoShow) {
        reason = 'both';
      } else if (seekerNoShow) {
        reason = 'seeker';
      } else {
        reason = 'companion';
      }

      this.logger.log(`No-show detected for booking ${booking.id}: ${reason}`);

      // Update booking status first
      await this.bookingsService.handleNoShow(booking.id, reason).catch((err) => {
        this.logger.error(`Failed to handle no-show for booking ${booking.id}: ${err.message}`);
      });

      // Handle payment based on who no-showed:
      // - seeker no-show: companion showed up → capture payment (companion gets paid)
      // - companion no-show: seeker showed up → cancel hold / refund seeker
      // - both no-show: cancel hold / full refund, no penalty
      if (reason === 'seeker') {
        await this.paymentsService.capturePayment(booking.id).catch((err) => {
          this.logger.error(`Failed to capture payment for no-show booking ${booking.id}: ${err.message}`);
        });
      } else {
        // companion or both no-show → refund seeker
        await this.paymentsService.cancelPaymentHold(booking.id).catch((err) => {
          this.logger.error(`Failed to cancel/refund payment for no-show booking ${booking.id}: ${err.message}`);
        });
      }

      // Notify both participants
      await this.sendNoShowNotifications(booking, reason);
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async sendBookingReminders(): Promise<void> {
    const now = new Date();

    // 24h window: bookings starting between 23h and 25h from now
    const window24hStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const window24hEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    // 1h window: bookings starting between 55min and 65min from now
    const window1hStart = new Date(now.getTime() + 55 * 60 * 1000);
    const window1hEnd = new Date(now.getTime() + 65 * 60 * 1000);

    const [bookings24h, bookings1h] = await Promise.all([
      this.bookingsRepository.find({
        where: { status: BookingStatus.CONFIRMED, dateTime: Between(window24hStart, window24hEnd) },
        relations: ['seeker', 'companion'],
      }),
      this.bookingsRepository.find({
        where: { status: BookingStatus.CONFIRMED, dateTime: Between(window1hStart, window1hEnd) },
        relations: ['seeker', 'companion'],
      }),
    ]);

    for (const booking of bookings24h) {
      await this.sendReminderNotifications(booking, '24h');
    }
    for (const booking of bookings1h) {
      await this.sendReminderNotifications(booking, '1h');
    }

    const total = bookings24h.length + bookings1h.length;
    if (total > 0) {
      this.logger.log(
        `[BookingsCron] Sent reminders for ${bookings24h.length} 24h and ${bookings1h.length} 1h upcoming bookings`,
      );
    }
  }

  private async sendReminderNotifications(booking: Booking, window: '24h' | '1h'): Promise<void> {
    const companionName = booking.companion?.name || 'your companion';
    const seekerName = booking.seeker?.name || 'your guest';
    const timeLabel = window === '24h' ? 'tomorrow' : 'in 1 hour';
    const type =
      window === '24h'
        ? NotificationType.BOOKING_REMINDER_24H
        : NotificationType.BOOKING_REMINDER_1H;

    const seekerDedupeKey = `reminder-${window}-${booking.id}-seeker`;
    const companionDedupeKey = `reminder-${window}-${booking.id}-companion`;

    await this.notificationsService
      .create({
        userId: booking.seekerId,
        type,
        title: `Date reminder — ${timeLabel}`,
        body: `Your date with ${companionName} is ${timeLabel}. Don't forget to check in on arrival.`,
        data: { bookingId: booking.id },
        pushToken: booking.seeker?.expoPushToken,
        notificationsEnabled: booking.seeker?.notificationsEnabled,
        notificationPreferences: booking.seeker
          ?.notificationPreferences as Record<string, boolean> | null,
        recipientEmail: booking.seeker?.email,
        deduplicationKey: seekerDedupeKey,
      })
      .catch((err) => {
        this.logger.error(
          `Failed to send ${window} reminder to seeker for booking ${booking.id}: ${err.message}`,
        );
      });

    await this.notificationsService
      .create({
        userId: booking.companionId,
        type,
        title: `Date reminder — ${timeLabel}`,
        body: `Your date with ${seekerName} is ${timeLabel}. Be ready and check in on arrival.`,
        data: { bookingId: booking.id },
        pushToken: booking.companion?.expoPushToken,
        notificationsEnabled: booking.companion?.notificationsEnabled,
        notificationPreferences: booking.companion
          ?.notificationPreferences as Record<string, boolean> | null,
        recipientEmail: booking.companion?.email,
        deduplicationKey: companionDedupeKey,
      })
      .catch((err) => {
        this.logger.error(
          `Failed to send ${window} reminder to companion for booking ${booking.id}: ${err.message}`,
        );
      });
  }

  private async sendNoShowNotifications(
    booking: Booking,
    reason: 'seeker' | 'companion' | 'both',
  ): Promise<void> {
    const seekerName = booking.seeker?.name || 'Your guest';
    const companionName = booking.companion?.name || 'Your companion';

    // Notification messages per scenario
    let seekerTitle: string;
    let seekerBody: string;
    let companionTitle: string;
    let companionBody: string;

    if (reason === 'seeker') {
      // Seeker didn't show up
      seekerTitle = 'Booking cancelled — no-show';
      seekerBody = `Your booking with ${companionName} was cancelled because you did not check in within 15 minutes. Payment was charged as a cancellation fee.`;
      companionTitle = 'Guest did not show up';
      companionBody = `${seekerName} did not check in for your date. The booking has been cancelled and you will receive a cancellation fee.`;
    } else if (reason === 'companion') {
      // Companion didn't show up
      seekerTitle = 'Companion did not show up';
      seekerBody = `${companionName} did not check in for your date. The booking has been cancelled and you have been fully refunded.`;
      companionTitle = 'Booking cancelled — no-show';
      companionBody = `You did not check in for your date with ${seekerName}. The booking has been cancelled and no payment will be made.`;
    } else {
      // Both didn't show up
      seekerTitle = 'Booking cancelled — no check-in';
      seekerBody = `Neither you nor ${companionName} checked in for the date. The booking has been cancelled and you have been fully refunded.`;
      companionTitle = 'Booking cancelled — no check-in';
      companionBody = `Neither you nor ${seekerName} checked in for the date. The booking has been cancelled.`;
    }

    const notifData = { bookingId: booking.id, noShowReason: reason };

    await this.notificationsService.create({
      userId: booking.seekerId,
      type: NotificationType.NO_SHOW,
      title: seekerTitle,
      body: seekerBody,
      data: notifData,
    }).catch((err) => {
      this.logger.error(`Failed to notify seeker for no-show booking ${booking.id}: ${err.message}`);
    });

    await this.notificationsService.create({
      userId: booking.companionId,
      type: NotificationType.NO_SHOW,
      title: companionTitle,
      body: companionBody,
      data: notifData,
    }).catch((err) => {
      this.logger.error(`Failed to notify companion for no-show booking ${booking.id}: ${err.message}`);
    });
  }
}
