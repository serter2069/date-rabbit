import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThan } from 'typeorm';
import { Booking, BookingStatus, ActivityType } from './entities/booking.entity';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    private usersService: UsersService,
    private emailService: EmailService,
  ) {}

  async create(data: {
    seekerId: string;
    companionId: string;
    dateTime: Date;
    duration: number;
    activity: ActivityType;
    location?: string;
    notes?: string;
  }): Promise<Booking> {
    const companion = await this.usersService.findById(data.companionId);
    if (!companion) {
      throw new HttpException('Companion not found', HttpStatus.NOT_FOUND);
    }
    const totalPrice = (companion.hourlyRate || 100) * data.duration;

    const booking = this.bookingsRepository.create({
      ...data,
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
      update.cancellationReason = reason;
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
    return updated;
  }
}
