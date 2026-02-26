import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import * as crypto from 'crypto';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { Verification } from './entities/verification.entity';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { UsersModule } from '../users/users.module';
import { UploadsModule } from '../uploads/uploads.module';

const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');

@Module({
  imports: [
    TypeOrmModule.forFeature([Verification]),
    MulterModule.register({
      storage: multer.diskStorage({
        destination: (req, _file, cb) => {
          // Determine upload subdirectory from request URL
          let subDir = 'id-photos';
          if (req.url.includes('selfie')) subDir = 'selfies';
          else if (req.url.includes('video')) subDir = 'videos';

          const dest = path.join(UPLOADS_ROOT, subDir);
          fs.mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname).toLowerCase();
          cb(null, `${crypto.randomUUID()}${ext}`);
        },
      }),
    }),
    UsersModule,
    UploadsModule,
  ],
  providers: [VerificationService],
  controllers: [VerificationController],
  exports: [VerificationService],
})
export class VerificationModule {}
