import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

// Run raw SQL that TypeORM synchronize cannot handle automatically.
// Enum value additions require ALTER TYPE and are idempotent via IF NOT EXISTS.
async function runEnumMigrations(dataSource: DataSource): Promise<void> {
  const newValues = ['booking_request', 'payment_received', 'new_review'];
  for (const value of newValues) {
    await dataSource
      .query(`ALTER TYPE notification_type_enum ADD VALUE IF NOT EXISTS '${value}'`)
      .catch(() => {
        // Ignore if type does not exist yet — synchronize will create it on first run
      });
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  // Apply enum migrations before app starts serving requests
  const dataSource = app.get(DataSource);
  await runEnumMigrations(dataSource);

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
  console.log(`🚀 DateRabbit API running on port ${port}`);
}
bootstrap();
