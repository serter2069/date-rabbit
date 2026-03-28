import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import * as crypto from 'crypto';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
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
import { UploadsModule } from '../uploads/uploads.module';

const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, DatePhoto, SelfieVerification]),
    MulterModule.register({
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
      storage: multer.diskStorage({
        destination: (_req, _file, cb) => {
          const dest = path.join(UPLOADS_ROOT, 'selfies');
          fs.mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
          cb(null, `${crypto.randomUUID()}${ext}`);
        },
      }),
    }),
    UsersModule,
    EmailModule,
    PaymentsModule,
    NotificationsModule,
    UploadsModule,
  ],
  providers: [BookingsService, BookingsCron],
  controllers: [BookingsController],
  exports: [BookingsService],
})
export class BookingsModule {}
