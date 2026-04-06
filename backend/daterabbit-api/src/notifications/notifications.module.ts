import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { NotificationDeliveryLog } from './entities/notification-delivery-log.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { EmailWorker } from './workers/email.worker';
import { PushWorker } from './workers/push.worker';
import { InAppWorker } from './workers/inapp.worker';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationPreference, NotificationDeliveryLog]),
    BullModule.registerQueue(
      { name: 'notifications-email' },
      { name: 'notifications-push' },
      { name: 'notifications-inapp' },
    ),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
    EmailModule,
  ],
  providers: [
    NotificationsService,
    NotificationsGateway,
    EmailWorker,
    PushWorker,
    InAppWorker,
  ],
  controllers: [NotificationsController],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
