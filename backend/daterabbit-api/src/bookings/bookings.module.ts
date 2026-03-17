import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookingsCron } from './bookings.cron';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [TypeOrmModule.forFeature([Booking]), UsersModule, EmailModule, PaymentsModule],
  providers: [BookingsService, BookingsCron],
  controllers: [BookingsController],
  exports: [BookingsService],
})
export class BookingsModule {}
