import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull } from 'typeorm';
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
