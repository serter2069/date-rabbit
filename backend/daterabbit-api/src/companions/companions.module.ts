import { Module } from '@nestjs/common';
import { CompanionsController } from './companions.controller';
import { UsersModule } from '../users/users.module';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  imports: [UsersModule, ReviewsModule],
  controllers: [CompanionsController],
})
export class CompanionsModule {}
