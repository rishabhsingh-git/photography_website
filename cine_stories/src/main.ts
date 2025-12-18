import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { json, urlencoded } from 'express';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(Logger);
  app.useLogger(logger);
  app.use(helmet());
  // Explicit CORS for credentialed requests (cookies/JWT)
  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(',').map((o) => o.trim()) || ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Disposition'],
  });
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 200,
    }),
  );
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);

  // Startup status summary with icons for quick sanity checks
  const status = (label: string, value: any) =>
    `${value ? '✅' : '⚠️'} ${label}: ${value ? 'set' : 'missing'}`;

  logger.log(`🚀 API ready on http://localhost:${port}/api`, 'Bootstrap');
  logger.log(status('Database', process.env.DATABASE_URL || process.env.DB_HOST), 'Bootstrap');
  logger.log(status('Redis', process.env.REDIS_URL), 'Bootstrap');
  logger.log(status('S3 endpoint', process.env.S3_ENDPOINT), 'Bootstrap');
  logger.log(status('JWT secret', process.env.JWT_SECRET), 'Bootstrap');
  logger.log(status('Google OAuth', process.env.GOOGLE_CLIENT_ID), 'Bootstrap');
  logger.log(status('Session secret', process.env.SESSION_SECRET), 'Bootstrap');
}

// critical: bootstrap must fail fast for misconfigurations, so we rely on
// ValidationPipe and config validation in AppModule
bootstrap();
