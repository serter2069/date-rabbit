import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

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
