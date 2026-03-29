import { Injectable, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThan } from 'typeorm';
import { Booking, BookingStatus, ActivityType } from './entities/booking.entity';
import { DatePhoto } from './entities/date-photo.entity';
import { SelfieVerification } from './entities/selfie-verification.entity';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { ReferralService } from '../referral/referral.service';
import { sanitizeText } from '../common/sanitize';
import { PackagesService } from '../packages/packages.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(DatePhoto)
    private datePhotosRepository: Repository<DatePhoto>,
    @InjectRepository(SelfieVerification)
    private selfieVerificationsRepository: Repository<SelfieVerification>,
    private usersService: UsersService,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
    @Inject(forwardRef(() => ReferralService))
    private referralService: ReferralService,
    private packagesService: PackagesService,
  ) {}

  async create(data: {
    seekerId: string;
    companionId: string;
    dateTime: Date;
    duration: number;
    activity: ActivityType;
    location?: string;
    notes?: string;
    packageId?: string;
  }): Promise<Booking> {
    const companion = await this.usersService.findById(data.companionId);
    if (!companion) {
      throw new HttpException('Companion not found', HttpStatus.NOT_FOUND);
    }

    // If packageId provided, validate and override price/duration/activity
    let totalPrice: number;
    let duration = data.duration;
    let activity = data.activity;
    let packageId: string | undefined;

    if (data.packageId) {
      const pkg = await this.packagesService.findById(data.packageId);
      if (!pkg) {
        throw new HttpException('Package not found', HttpStatus.NOT_FOUND);
      }
      if (pkg.companionId !== data.companionId) {
        throw new HttpException('Package does not belong to this companion', HttpStatus.BAD_REQUEST);
      }
      if (!pkg.isActive) {
        throw new HttpException('Package is not active', HttpStatus.BAD_REQUEST);
      }
      // Package price is TOTAL (not hourly)
      totalPrice = Number(pkg.price);
      duration = pkg.template.defaultDuration;
      activity = pkg.template.defaultActivity;
      packageId = data.packageId;
    } else {
      totalPrice = (companion.hourlyRate || 100) * duration;
    }

    // Check for exact duplicate: same seeker + companion + dateTime with active status
    const duplicate = await this.bookingsRepository
      .createQueryBuilder('b')
      .where('b.seekerId = :seekerId', { seekerId: data.seekerId })
      .andWhere('b.companionId = :companionId', { companionId: data.companionId })
      .andWhere('b.dateTime = :dateTime', { dateTime: new Date(data.dateTime) })
      .andWhere('b.status IN (:...statuses)', {
        statuses: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.PAID],
      })
      .getOne();

    if (duplicate) {
      throw new HttpException(
        'A booking request for this companion at the same time already exists',
        HttpStatus.CONFLICT,
      );
    }

    // Check for overlapping bookings for this companion (race condition guard)
    const bookingStart = new Date(data.dateTime);
    const bookingEnd = new Date(bookingStart.getTime() + duration * 60 * 60 * 1000);

    const existing = await this.bookingsRepository
      .createQueryBuilder('b')
      .where('b.companionId = :companionId', { companionId: data.companionId })
      .andWhere('b.status IN (:...statuses)', {
        statuses: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.PAID],
      })
      .andWhere('b.dateTime < :end', { end: bookingEnd })
      .andWhere(
        "b.dateTime + (b.duration * interval '1 hour') > :start",
        { start: bookingStart },
      )
      .getOne();

    if (existing) {
      throw new HttpException(
        'Companion already has a booking at that time',
        HttpStatus.CONFLICT,
      );
    }

    const booking = this.bookingsRepository.create({
      ...data,
      duration,
      activity,
      packageId,
      notes: data.notes ? sanitizeText(data.notes) : data.notes,
      location: data.location ? sanitizeText(data.location) : data.location,
      totalPrice,
      status: BookingStatus.PENDING,
    });

    return this.bookingsRepository.save(booking);
  }

  async findById(id: string): Promise<Booking | null> {
    return this.bookingsRepository.findOne({
      where: { id },
      relations: ['seeker', 'companion'],
    });
  }

  async findByUser(userId: string, role: 'seeker' | 'companion'): Promise<Booking[]> {
    const where = role === 'seeker' ? { seekerId: userId } : { companionId: userId };
    return this.bookingsRepository.find({
      where,
      relations: ['seeker', 'companion'],
      order: { dateTime: 'DESC' },
    });
  }

  async findByUserFiltered(
    userId: string,
    filter: 'all' | 'upcoming' | 'pending' | 'past',
    page = 1,
    limit = 20,
  ): Promise<{ bookings: Booking[]; total: number }> {
    const now = new Date();
    const skip = (page - 1) * limit;

    // Build where conditions for both seeker and companion roles
    let seekerWhere: object;
    let companionWhere: object;

    switch (filter) {
      case 'upcoming':
        // Confirmed/paid bookings with a future date + cancelled bookings with future dates
        seekerWhere = [
          { seekerId: userId, status: BookingStatus.CONFIRMED, dateTime: MoreThanOrEqual(now) },
          { seekerId: userId, status: BookingStatus.PAID, dateTime: MoreThanOrEqual(now) },
          { seekerId: userId, status: BookingStatus.CANCELLED, dateTime: MoreThanOrEqual(now) },
        ];
        companionWhere = [
          { companionId: userId, status: BookingStatus.CONFIRMED, dateTime: MoreThanOrEqual(now) },
          { companionId: userId, status: BookingStatus.PAID, dateTime: MoreThanOrEqual(now) },
          { companionId: userId, status: BookingStatus.CANCELLED, dateTime: MoreThanOrEqual(now) },
        ];
        break;

      case 'pending':
        seekerWhere = [{ seekerId: userId, status: BookingStatus.PENDING }];
        companionWhere = [{ companionId: userId, status: BookingStatus.PENDING }];
        break;

      case 'past':
        // Completed/cancelled bookings with past dates OR confirmed/paid bookings with past dates
        seekerWhere = [
          { seekerId: userId, status: BookingStatus.COMPLETED },
          { seekerId: userId, status: BookingStatus.CANCELLED, dateTime: LessThan(now) },
          { seekerId: userId, dateTime: LessThan(now), status: BookingStatus.CONFIRMED },
          { seekerId: userId, dateTime: LessThan(now), status: BookingStatus.PAID },
        ];
        companionWhere = [
          { companionId: userId, status: BookingStatus.COMPLETED },
          { companionId: userId, status: BookingStatus.CANCELLED, dateTime: LessThan(now) },
          { companionId: userId, dateTime: LessThan(now), status: BookingStatus.CONFIRMED },
          { companionId: userId, dateTime: LessThan(now), status: BookingStatus.PAID },
        ];
        break;

      default: // 'all'
        seekerWhere = [{ seekerId: userId }];
        companionWhere = [{ companionId: userId }];
        break;
    }

    const allWhere = [
      ...(Array.isArray(seekerWhere) ? seekerWhere : [seekerWhere]),
      ...(Array.isArray(companionWhere) ? companionWhere : [companionWhere]),
    ];

    const [bookings, total] = await this.bookingsRepository.findAndCount({
      where: allWhere,
      relations: ['seeker', 'companion'],
      order: { dateTime: filter === 'past' ? 'DESC' : 'ASC' },
      skip,
      take: limit,
    });

    return { bookings, total };
  }

  async updateStatus(id: string, status: BookingStatus, reason?: string): Promise<Booking | null> {
    const update: Partial<Booking> = { status };
    if (reason) {
      update.cancellationReason = sanitizeText(reason);
    }
    await this.bookingsRepository.update(id, update);
    return this.findById(id);
  }

  async confirm(id: string): Promise<Booking | null> {
    const booking = await this.updateStatus(id, BookingStatus.CONFIRMED);
    if (!booking) return null;

    // Send confirmation emails to both parties (fire-and-forget)
    const emailData = {
      dateTime: booking.dateTime,
      duration: booking.duration,
      activity: booking.activity,
      location: booking.location,
      totalPrice: booking.totalPrice,
    };

    if (booking.seeker?.email) {
      this.emailService
        .sendBookingConfirmedToSeeker({
          seekerEmail: booking.seeker.email,
          seekerName: booking.seeker.name || 'there',
          companionName: booking.companion?.name || 'your companion',
          ...emailData,
        })
        .catch(() => {
          // Email errors must not break the booking confirmation
        });
    }

    if (booking.companion?.email) {
      this.emailService
        .sendBookingConfirmedToCompanion({
          companionEmail: booking.companion.email,
          companionName: booking.companion.name || 'there',
          seekerName: booking.seeker?.name || 'your guest',
          ...emailData,
        })
        .catch(() => {
          // Email errors must not break the booking confirmation
        });
    }

    return booking;
  }

  async getUpcoming(userId: string): Promise<Booking[]> {
    return this.bookingsRepository.find({
      where: [
        { seekerId: userId, status: BookingStatus.CONFIRMED },
        { seekerId: userId, status: BookingStatus.PAID },
        { companionId: userId, status: BookingStatus.CONFIRMED },
        { companionId: userId, status: BookingStatus.PAID },
      ],
      relations: ['seeker', 'companion'],
      order: { dateTime: 'ASC' },
      take: 5,
    });
  }

  async getPendingRequests(companionId: string): Promise<Booking[]> {
    return this.bookingsRepository.find({
      where: { companionId, status: BookingStatus.PENDING },
      relations: ['seeker'],
      order: { createdAt: 'DESC' },
    });
  }

  async complete(id: string, userId: string): Promise<Booking> {
    const booking = await this.findById(id);

    if (!booking) {
      throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    }

    if (booking.seekerId !== userId && booking.companionId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }

    if (
      booking.status !== BookingStatus.CONFIRMED &&
      booking.status !== BookingStatus.PAID
    ) {
      throw new HttpException(
        `Cannot complete a ${booking.status} booking`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Booking date must be today or in the past
    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    if (new Date(booking.dateTime) > todayEnd) {
      throw new HttpException(
        'Cannot complete a future booking',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updated = await this.updateStatus(id, BookingStatus.COMPLETED);
    if (!updated) {
      throw new HttpException('Failed to update booking', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Credit referral bonus if seeker was referred and has no credited referral yet
    try {
      const seeker = await this.usersService.findById(updated.seekerId);
      if (seeker?.referredBy) {
        await this.referralService.creditBonus(updated.seekerId);
      }
    } catch (err) {
      // Referral credit failure must not break booking completion
      console.error('[REFERRAL] Failed to credit bonus:', err);
    }

    return updated;
  }

  async seekerCheckin(bookingId: string, seekerId: string, lat?: number, lon?: number): Promise<Booking> {
    const booking = await this.findById(bookingId);
    if (!booking) throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    if (booking.seekerId !== seekerId) throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    if (booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.PAID) {
      throw new HttpException('Booking is not in a confirmable state', HttpStatus.BAD_REQUEST);
    }
    // Group 2: Log geo coordinates for future distance validation
    if (lat !== undefined && lon !== undefined) {
      console.log(`[GEO] Seeker checkin booking=${bookingId} lat=${lat} lon=${lon}`);
    }
    const now = new Date();
    const update: Partial<Booking> = { seekerCheckinAt: now };
    if (booking.companionCheckinAt) {
      update.status = BookingStatus.ACTIVE;
      update.activeDateStartedAt = now;
    }
    await this.bookingsRepository.update(bookingId, update);
    return (await this.findById(bookingId))!;
  }

  async companionCheckin(bookingId: string, companionId: string, lat?: number, lon?: number): Promise<Booking> {
    const booking = await this.findById(bookingId);
    if (!booking) throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    if (booking.companionId !== companionId) throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    if (booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.PAID) {
      throw new HttpException('Booking is not in a confirmable state', HttpStatus.BAD_REQUEST);
    }
    // Group 2: Log geo coordinates for future distance validation
    if (lat !== undefined && lon !== undefined) {
      console.log(`[GEO] Companion checkin booking=${bookingId} lat=${lat} lon=${lon}`);
    }
    const now = new Date();
    const update: Partial<Booking> = { companionCheckinAt: now };
    if (booking.seekerCheckinAt) {
      update.status = BookingStatus.ACTIVE;
      update.activeDateStartedAt = now;
    }
    await this.bookingsRepository.update(bookingId, update);
    return (await this.findById(bookingId))!;
  }

  async triggerSOS(bookingId: string, userId: string, lat?: number, lon?: number): Promise<Booking> {
    const booking = await this.findById(bookingId);
    if (!booking) throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    if (booking.seekerId !== userId && booking.companionId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }
    const update: Partial<Booking> = {
      sosTriggeredAt: new Date(),
      sosTriggeredBy: userId,
    };
    if (lat !== undefined) update.sosLat = lat;
    if (lon !== undefined) update.sosLon = lon;
    await this.bookingsRepository.update(bookingId, update);

    const triggeredBy = userId === booking.seekerId ? booking.seeker?.name || 'Seeker' : booking.companion?.name || 'Companion';
    const locationNote = lat !== undefined && lon !== undefined ? ` Location: ${lat.toFixed(5)}, ${lon.toFixed(5)}.` : '';
    const notifyData = { bookingId, triggeredBy: userId };

    // Notify both parties (fire-and-forget)
    const notifications = [
      this.notificationsService.create({
        userId: booking.seekerId,
        type: NotificationType.SOS_ALERT,
        title: 'SOS Alert Triggered',
        body: `${triggeredBy} triggered an SOS alert for your date.${locationNote} Our team has been notified.`,
        data: notifyData,
      }),
      this.notificationsService.create({
        userId: booking.companionId,
        type: NotificationType.SOS_ALERT,
        title: 'SOS Alert Triggered',
        body: `${triggeredBy} triggered an SOS alert for your date.${locationNote} Our team has been notified.`,
        data: notifyData,
      }),
    ];
    await Promise.all(notifications.map(p => p.catch(e => console.error('[SOS] notification error', e))));

    return (await this.findById(bookingId))!;
  }

  async endEarly(bookingId: string, userId: string): Promise<Booking> {
    const booking = await this.findById(bookingId);
    if (!booking) throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    if (booking.seekerId !== userId && booking.companionId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }
    if (booking.status !== BookingStatus.ACTIVE && booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.PAID) {
      throw new HttpException('Cannot end this booking early', HttpStatus.BAD_REQUEST);
    }
    const now = new Date();
    let actualHours = booking.duration;
    if (booking.activeDateStartedAt) {
      actualHours = Math.max(0.25, (now.getTime() - new Date(booking.activeDateStartedAt).getTime()) / 3600000);
      actualHours = Math.round(actualHours * 4) / 4; // round to nearest 15 min
    }
    await this.bookingsRepository.update(bookingId, {
      status: BookingStatus.COMPLETED,
      activeDateEndedAt: now,
      actualDurationHours: actualHours,
    });
    return (await this.findById(bookingId))!;
  }

  async handleNoShow(bookingId: string, reason: 'seeker' | 'companion' | 'both'): Promise<Booking> {
    await this.bookingsRepository.update(bookingId, {
      status: BookingStatus.CANCELLED,
      noShowReason: reason,
      cancellationReason: `No-show: ${reason} did not check in`,
    });
    return (await this.findById(bookingId))!;
  }

  async getActiveDateBooking(userId: string): Promise<Booking | null> {
    return this.bookingsRepository.findOne({
      where: [
        { seekerId: userId, status: BookingStatus.ACTIVE },
        { companionId: userId, status: BookingStatus.ACTIVE },
      ],
      relations: ['seeker', 'companion'],
    });
  }

  // --- Group 1: Safety check-in ---

  async safetyCheckin(bookingId: string, userId: string): Promise<Booking> {
    const booking = await this.findById(bookingId);
    if (!booking) throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    if (booking.seekerId !== userId && booking.companionId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }
    if (booking.status !== BookingStatus.ACTIVE) {
      throw new HttpException('Booking is not active', HttpStatus.BAD_REQUEST);
    }
    await this.bookingsRepository.update(bookingId, { safetyCheckinAt: new Date() });
    return this.findById(bookingId) as Promise<Booking>;
  }

  // --- Group 1: Photos ---

  async addPhoto(bookingId: string, userId: string, url: string): Promise<DatePhoto> {
    const booking = await this.findById(bookingId);
    if (!booking) throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    if (booking.seekerId !== userId && booking.companionId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }
    const photo = this.datePhotosRepository.create({
      bookingId,
      url,
      uploadedBy: userId,
    });
    return this.datePhotosRepository.save(photo);
  }

  async getPhotos(bookingId: string, userId: string): Promise<DatePhoto[]> {
    const booking = await this.findById(bookingId);
    if (!booking) throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    if (booking.seekerId !== userId && booking.companionId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }
    return this.datePhotosRepository.find({
      where: { bookingId },
      order: { createdAt: 'ASC' },
    });
  }

  // --- Group 1: Date plan ---

  async getDatePlan(bookingId: string, userId: string): Promise<Record<string, any> | null> {
    const booking = await this.findById(bookingId);
    if (!booking) throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    if (booking.seekerId !== userId && booking.companionId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }
    return booking.datePlan || null;
  }

  async updateDatePlan(bookingId: string, userId: string, plan: Record<string, any>): Promise<Booking> {
    const booking = await this.findById(bookingId);
    if (!booking) throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    if (booking.seekerId !== userId) {
      throw new HttpException('Only seeker can update the date plan', HttpStatus.FORBIDDEN);
    }
    if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) {
      throw new HttpException('Cannot update plan for a finished booking', HttpStatus.BAD_REQUEST);
    }
    await this.bookingsRepository.update(bookingId, { datePlan: plan });
    return this.findById(bookingId) as Promise<Booking>;
  }

  // --- Group 1: Report issue ---

  async reportIssue(
    bookingId: string,
    userId: string,
    issueType: string,
    issueText: string,
  ): Promise<Booking> {
    const booking = await this.findById(bookingId);
    if (!booking) throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    if (booking.seekerId !== userId && booking.companionId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }
    await this.bookingsRepository.update(bookingId, {
      reportIssueType: sanitizeText(issueType),
      reportIssueText: sanitizeText(issueText),
    });

    // Notify both parties about the report (fire-and-forget)
    const reporterName = userId === booking.seekerId ? booking.seeker?.name || 'Seeker' : booking.companion?.name || 'Companion';
    const notifyData = { bookingId, issueType };
    const notifications = [
      this.notificationsService.create({
        userId: booking.seekerId,
        type: NotificationType.REPORT_ISSUE,
        title: 'Issue Reported',
        body: `${reporterName} filed a report (${issueType}) for your date. Our team will review it shortly.`,
        data: notifyData,
      }),
      this.notificationsService.create({
        userId: booking.companionId,
        type: NotificationType.REPORT_ISSUE,
        title: 'Issue Reported',
        body: `${reporterName} filed a report (${issueType}) for your date. Our team will review it shortly.`,
        data: notifyData,
      }),
    ];
    await Promise.all(notifications.map(p => p.catch(e => console.error('[REPORT] notification error', e))));

    return this.findById(bookingId) as Promise<Booking>;
  }

  // --- Group 1: Extend request ---

  async requestExtend(bookingId: string, userId: string, hours: number): Promise<Booking> {
    const booking = await this.findById(bookingId);
    if (!booking) throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    if (booking.seekerId !== userId) {
      throw new HttpException('Only seeker can request extension', HttpStatus.FORBIDDEN);
    }
    if (booking.status !== BookingStatus.ACTIVE) {
      throw new HttpException('Can only extend an active date', HttpStatus.BAD_REQUEST);
    }
    if (hours <= 0 || hours > 8) {
      throw new HttpException('Extension hours must be between 0 and 8', HttpStatus.BAD_REQUEST);
    }
    await this.bookingsRepository.update(bookingId, {
      extendRequestedHours: hours,
      extendRequestedAt: new Date(),
      extendApproved: undefined,
    });
    return this.findById(bookingId) as Promise<Booking>;
  }

  // --- Group 2: Extend response (companion accept/reject) ---

  async respondExtend(bookingId: string, companionId: string, approved: boolean): Promise<Booking> {
    const booking = await this.findById(bookingId);
    if (!booking) throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    if (booking.companionId !== companionId) {
      throw new HttpException('Only companion can respond to extension', HttpStatus.FORBIDDEN);
    }
    if (!booking.extendRequestedAt || booking.extendApproved !== null && booking.extendApproved !== undefined) {
      throw new HttpException('No pending extension request', HttpStatus.BAD_REQUEST);
    }
    const update: Partial<Booking> = { extendApproved: approved };
    if (approved && booking.extendRequestedHours) {
      update.duration = booking.duration + booking.extendRequestedHours;
      // Recalculate total price
      const companion = await this.usersService.findById(companionId);
      const hourlyRate = companion?.hourlyRate || 100;
      update.totalPrice = booking.totalPrice + booking.extendRequestedHours * hourlyRate;
    }
    await this.bookingsRepository.update(bookingId, update);
    return this.findById(bookingId) as Promise<Booking>;
  }

  /**
   * Check if any booking exists between a seeker and companion (any status).
   */
  async hasAnyBooking(seekerId: string, companionId: string): Promise<boolean> {
    const count = await this.bookingsRepository.count({
      where: { seekerId, companionId },
    });
    return count > 0;
  }

  // --- UC-061: Selfie verification ---

  async submitSelfie(bookingId: string, userId: string, photoUrl: string): Promise<SelfieVerification> {
    const booking = await this.findById(bookingId);
    if (!booking) throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    if (booking.seekerId !== userId && booking.companionId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }
    if (booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.PAID) {
      throw new HttpException('Selfie verification is only available for confirmed/paid bookings', HttpStatus.BAD_REQUEST);
    }

    // Check if user already submitted a selfie for this booking
    const existing = await this.selfieVerificationsRepository.findOne({
      where: { bookingId, userId },
    });
    if (existing) {
      // Update existing selfie
      await this.selfieVerificationsRepository.update(existing.id, {
        photoUrl,
        verified: true,
      });
      await this.checkBothSelfiesSubmitted(bookingId);
      return (await this.selfieVerificationsRepository.findOne({ where: { id: existing.id } }))!;
    }

    // Create new selfie verification record (MVP: auto-verified on upload)
    const selfie = this.selfieVerificationsRepository.create({
      bookingId,
      userId,
      photoUrl,
      verified: true, // MVP: no AI face matching, auto-verify on upload
    });
    const saved = await this.selfieVerificationsRepository.save(selfie);

    // Check if both participants have submitted selfies
    await this.checkBothSelfiesSubmitted(bookingId);

    return saved;
  }

  async getSelfieStatus(bookingId: string, userId: string): Promise<{
    selfieVerified: boolean;
    seeker: { submitted: boolean; photoUrl?: string; verifiedAt?: Date } | null;
    companion: { submitted: boolean; photoUrl?: string; verifiedAt?: Date } | null;
  }> {
    const booking = await this.findById(bookingId);
    if (!booking) throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    if (booking.seekerId !== userId && booking.companionId !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }

    const selfies = await this.selfieVerificationsRepository.find({
      where: { bookingId },
    });

    const seekerSelfie = selfies.find(s => s.userId === booking.seekerId);
    const companionSelfie = selfies.find(s => s.userId === booking.companionId);

    return {
      selfieVerified: booking.selfieVerified,
      seeker: seekerSelfie ? {
        submitted: true,
        photoUrl: seekerSelfie.photoUrl,
        verifiedAt: seekerSelfie.createdAt,
      } : { submitted: false },
      companion: companionSelfie ? {
        submitted: true,
        photoUrl: companionSelfie.photoUrl,
        verifiedAt: companionSelfie.createdAt,
      } : { submitted: false },
    };
  }

  private async checkBothSelfiesSubmitted(bookingId: string): Promise<void> {
    const booking = await this.findById(bookingId);
    if (!booking) return;

    const count = await this.selfieVerificationsRepository.count({
      where: { bookingId, verified: true },
    });

    if (count >= 2 && !booking.selfieVerified) {
      await this.bookingsRepository.update(bookingId, { selfieVerified: true });
    }
  }
}
