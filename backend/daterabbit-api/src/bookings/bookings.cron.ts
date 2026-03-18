import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { BookingsService } from './bookings.service';

@Injectable()
export class BookingsCron {
  private readonly logger = new Logger(BookingsCron.name);

  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    private bookingsService: BookingsService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkNoShows() {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const bookings = await this.bookingsRepository.find({
      where: [
        { status: BookingStatus.CONFIRMED, dateTime: LessThan(fifteenMinutesAgo), seekerCheckinAt: IsNull() },
        { status: BookingStatus.PAID, dateTime: LessThan(fifteenMinutesAgo), seekerCheckinAt: IsNull() },
      ],
    });

    for (const booking of bookings) {
      this.logger.log(`No-show detected for booking ${booking.id}`);
      const reason = !booking.companionCheckinAt ? 'seeker' : 'companion';
      await this.bookingsService.handleNoShow(booking.id, reason).catch(() => {});
      // TODO: Trigger Stripe refund for no-show bookings
      // If seeker no-show: release hold / partial charge for companion compensation
      // If companion no-show: full refund to seeker
      // Implement via PaymentsService when Stripe logic is ready
    }
  }
}
