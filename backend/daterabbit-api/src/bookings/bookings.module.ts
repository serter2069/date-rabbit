import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { Booking } from './entities/booking.entity';
import { DatePhoto } from './entities/date-photo.entity';
import { SelfieVerification } from './entities/selfie-verification.entity';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookingsCron } from './bookings.cron';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';
import { PaymentsModule } from '../payments/payments.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ReferralModule } from '../referral/referral.module';
import { UploadsModule } from '../uploads/uploads.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { PackagesModule } from '../packages/packages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, DatePhoto, SelfieVerification]),
    MulterModule.register({
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
      storage: multer.memoryStorage(),
    }),
    UsersModule,
    EmailModule,
    PaymentsModule,
    NotificationsModule,
    ReferralModule,
    UploadsModule,
    forwardRef(() => ReviewsModule),
    PackagesModule,
  ],
  providers: [BookingsService, BookingsCron],
  controllers: [BookingsController],
  exports: [BookingsService],
})
export class BookingsModule {}
