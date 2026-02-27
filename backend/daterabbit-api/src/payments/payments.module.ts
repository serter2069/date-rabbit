import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController, WebhooksController } from './payments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Booking])],
  providers: [PaymentsService],
  controllers: [PaymentsController, WebhooksController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
