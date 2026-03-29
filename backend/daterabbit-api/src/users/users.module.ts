import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { User } from './entities/user.entity';
import { BlockedUser } from './entities/blocked-user.entity';
import { UserReport } from './entities/user-report.entity';
import { Favorite } from './entities/favorite.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, BlockedUser, UserReport, Favorite]),
    MulterModule.register({
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
      storage: multer.memoryStorage(),
    }),
    UploadsModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
