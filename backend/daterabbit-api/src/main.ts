import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { runRefreshTokensMigration } from './auth/migrations/create-refresh-tokens';
import { runNotificationTablesMigration } from './notifications/migrations/create-notification-tables';
import { runAddExpiredBookingStatusMigration } from './bookings/migrations/add-expired-booking-status';
import { runAddProfileVideoUrlMigration } from './users/migrations/add-profile-video-url';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  // Run idempotent bootstrap migration for refresh_tokens table
  // Required because synchronize=false in production
  try {
    const dataSource = app.get<DataSource>(getDataSourceToken());
    await runRefreshTokensMigration(dataSource);
    console.log('refresh_tokens migration: OK');
  } catch (err) {
    console.error('refresh_tokens migration failed:', err);
    // Non-fatal: app still starts, but refresh tokens won't work until fixed
  }

  try {
    const dataSource = app.get<DataSource>(getDataSourceToken());
    await runNotificationTablesMigration(dataSource);
    console.log('notification_tables migration: OK');
  } catch (err) {
    console.error('notification_tables migration failed:', err);
    // Non-fatal: app still starts, but notification preferences/logs won't work until fixed
  }

  try {
    const dataSource = app.get<DataSource>(getDataSourceToken());
    await runAddExpiredBookingStatusMigration(dataSource);
    console.log('add_expired_booking_status migration: OK');
  } catch (err) {
    console.error('add_expired_booking_status migration failed:', err);
    // Non-fatal: app still starts, but expiry cron will fail until fixed
  }

  try {
    const dataSource = app.get<DataSource>(getDataSourceToken());
    await runAddProfileVideoUrlMigration(dataSource);
    console.log('add_profile_video_url migration: OK');
  } catch (err) {
    console.error('add_profile_video_url migration failed:', err);
    // Non-fatal: app still starts
  }

  // Enable CORS
  const corsOrigins = ['https://daterabbit.smartlaunchhub.com'];
  if (process.env.NODE_ENV !== 'production') {
    corsOrigins.push('http://localhost:8081', 'http://localhost:19006');
  }
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  // API prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`DateRabbit API running on port ${port}`);
}
bootstrap();
