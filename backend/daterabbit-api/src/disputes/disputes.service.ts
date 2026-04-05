import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Dispute, DisputeStatus } from './entities/dispute.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';

const DISPUTABLE_STATUSES: BookingStatus[] = [
  BookingStatus.CONFIRMED,
  BookingStatus.PAID,
  BookingStatus.ACTIVE,
  BookingStatus.COMPLETED,
];

@Injectable()
export class DisputesService {
  constructor(
    @InjectRepository(Dispute)
    private disputesRepo: Repository<Dispute>,
    @InjectRepository(Booking)
    private bookingsRepo: Repository<Booking>,
  ) {}

  async createDispute(bookingId: string, userId: string, reason: string): Promise<Dispute> {
    const booking = await this.bookingsRepo.findOne({ where: { id: bookingId } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.seekerId !== userId && booking.companionId !== userId) {
      throw new ForbiddenException('You are not a participant of this booking');
    }

    if (!DISPUTABLE_STATUSES.includes(booking.status)) {
      throw new BadRequestException(
        `Cannot open a dispute for a booking with status "${booking.status}". ` +
        `Allowed statuses: ${DISPUTABLE_STATUSES.join(', ')}`,
      );
    }

    const existing = await this.disputesRepo.findOne({
      where: {
        bookingId,
        status: In([DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW]),
      },
    });
    if (existing) {
      throw new ConflictException('An open dispute already exists for this booking');
    }

    const dispute = this.disputesRepo.create({
      bookingId,
      openedByUserId: userId,
      reason,
      status: DisputeStatus.OPEN,
    });

    return this.disputesRepo.save(dispute);
  }
}
