import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message, Conversation } from './entities/message.entity';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { UsersModule } from '../users/users.module';
import { BookingsModule } from '../bookings/bookings.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Conversation]),
    UsersModule,
    BookingsModule,
    forwardRef(() => NotificationsModule),
  ],
  providers: [MessagesService],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}
