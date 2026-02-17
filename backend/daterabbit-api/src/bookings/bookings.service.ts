import { Injectable } from '@nestjs/common';
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
    const totalPrice = (companion?.hourlyRate || 100) * data.duration;

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
        { companionId: userId, status: BookingStatus.CONFIRMED },
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
}
