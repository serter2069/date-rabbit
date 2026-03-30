import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { Verification } from './entities/verification.entity';
import { VerificationService } from './verification.service';
import { VerificationController, VerificationWebhookController } from './verification.controller';
import { UsersModule } from '../users/users.module';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Verification]),
    MulterModule.register({
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max (video verification)
      storage: multer.memoryStorage(),
    }),
    UsersModule,
    UploadsModule,
  ],
  providers: [VerificationService],
  controllers: [VerificationController, VerificationWebhookController],
  exports: [VerificationService],
})
export class VerificationModule {}
