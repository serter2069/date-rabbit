import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus, ActivityType } from './entities/booking.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    private usersService: UsersService,
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

  async updateStatus(id: string, status: BookingStatus, reason?: string): Promise<Booking | null> {
    const update: Partial<Booking> = { status };
    if (reason) {
      update.cancellationReason = reason;
    }
    await this.bookingsRepository.update(id, update);
    return this.findById(id);
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

    return this.updateStatus(id, BookingStatus.COMPLETED);
  }
}
