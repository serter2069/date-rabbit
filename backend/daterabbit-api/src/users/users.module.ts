import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { User } from './entities/user.entity';
import { BlockedUser } from './entities/blocked-user.entity';
import { UserReport } from './entities/user-report.entity';
import { Favorite } from './entities/favorite.entity';
import { OnlineWatcher } from './entities/online-watcher.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UploadsModule } from '../uploads/uploads.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, BlockedUser, UserReport, Favorite, OnlineWatcher]),
    MulterModule.register({
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
      storage: multer.memoryStorage(),
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only JPEG, PNG and WebP images are allowed'), false);
        }
      },
    }),
    UploadsModule,
    forwardRef(() => NotificationsModule),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
