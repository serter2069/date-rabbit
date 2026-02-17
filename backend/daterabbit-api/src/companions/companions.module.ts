import { Module } from '@nestjs/common';
import { CompanionsController } from './companions.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [CompanionsController],
})
export class CompanionsModule {}
