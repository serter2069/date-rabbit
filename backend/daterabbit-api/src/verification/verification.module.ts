import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { Verification } from './entities/verification.entity';
import { VerificationService } from './verification.service';
import { VerificationController, VerificationWebhookController } from './verification.controller';
import { UsersModule } from '../users/users.module';
import { UploadsModule } from '../uploads/uploads.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Verification]),
    MulterModule.register({
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max (video verification)
      storage: multer.memoryStorage(),
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type'), false);
        }
      },
    }),
    UsersModule,
    UploadsModule,
    NotificationsModule,
  ],
  providers: [VerificationService],
  controllers: [VerificationController, VerificationWebhookController],
  exports: [VerificationService],
})
export class VerificationModule {}
