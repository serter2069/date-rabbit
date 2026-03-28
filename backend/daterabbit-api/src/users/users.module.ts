import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import * as crypto from 'crypto';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { User } from './entities/user.entity';
import { BlockedUser } from './entities/blocked-user.entity';
import { UserReport } from './entities/user-report.entity';
import { Favorite } from './entities/favorite.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UploadsModule } from '../uploads/uploads.module';

const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');

@Module({
  imports: [
    TypeOrmModule.forFeature([User, BlockedUser, UserReport, Favorite]),
    MulterModule.register({
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
      storage: multer.diskStorage({
        destination: (_req, _file, cb) => {
          const dest = path.join(UPLOADS_ROOT, 'profile-photos');
          fs.mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname).toLowerCase();
          cb(null, `${crypto.randomUUID()}${ext}`);
        },
      }),
    }),
    UploadsModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
