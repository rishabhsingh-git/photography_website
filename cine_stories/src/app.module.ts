import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { LogLevel } from 'typeorm';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { LoggerModule } from 'nestjs-pino';

import configuration from './config/configuration';
import { validationSchema } from './config/env.validation';
import { DatabaseModule } from './infrastructure/database/database.module';
import { StorageModule } from './modules/storage/storage.module';
import { AuthModule } from './modules/auth/auth.module';
import { NotificationModule } from './modules/notification/notification.module';
import { SearchModule } from './modules/search/search.module';
import { MediaModule } from './modules/media/media.module';
import { WorkerModule } from './modules/worker/worker.module';
import { EventModule } from './modules/event/event.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ServiceModule } from './modules/service/service.module';
import { CartModule } from './modules/cart/cart.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { UserModule } from './modules/user/user.module';
import { CategoryModule } from './modules/category/category.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport:
          process.env.NODE_ENV === 'production'
            ? undefined
            : {
                target: 'pino-pretty',
                options: { 
                  colorize: true, 
                  singleLine: false,
                  translateTime: 'HH:MM:ss Z',
                  ignore: 'pid,hostname',
                },
              },
      },
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 60,
      // CRITICAL: switch to redis-backed limiter here by providing redis store
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT || 6379),
      },
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        // Use DATABASE_URL if provided, otherwise construct from individual parts
        // If DB_HOST is explicitly set, use it; otherwise default to localhost for local dev
        const dbConfig = process.env.DATABASE_URL
          ? { url: process.env.DATABASE_URL }
          : {
              host: process.env.DB_HOST || (process.env.NODE_ENV === 'production' ? 'db' : 'localhost'),
              port: Number(process.env.DB_PORT || 5432),
              username: process.env.DB_USER || 'cine_stories',
              password: process.env.DB_PASS || 'cine_stories',
              database: process.env.DB_NAME || 'cine_stories',
            };

        const config = {
          type: 'postgres' as const,
          ...dbConfig,
          autoLoadEntities: true,
          synchronize: process.env.NODE_ENV !== 'production', // Only sync in dev
          logging: process.env.NODE_ENV === 'development' ? (['error', 'warn', 'query'] as LogLevel[]) : false,
          // Connection pool settings to prevent stale connections
          extra: {
            max: 20, // Maximum pool size
            min: 5, // Minimum pool size
            idleTimeoutMillis: 30000, // Close idle connections after 30s
            connectionTimeoutMillis: 2000, // Timeout after 2s if connection cannot be established
            // CRITICAL: Ensure immediate commit
            statement_timeout: 30000, // 30 second timeout for statements
          },
          // Note: Transaction isolation level is set per-transaction, not globally
          // We use READ COMMITTED in all transaction() calls for immediate visibility
        };

        console.log('🔌 [TypeORM] Database connection config:', {
          type: config.type,
          host: dbConfig.host || 'from DATABASE_URL',
          database: dbConfig.database || 'from DATABASE_URL',
          synchronize: config.synchronize,
        });

        return config;
      },
    }),
    DatabaseModule,
    StorageModule,
    AuthModule,
    NotificationModule,
    SearchModule,
    MediaModule,
    WorkerModule,
    EventModule,
    PaymentModule,
    ServiceModule,
    CartModule,
    AnalyticsModule,
    UserModule,
    CategoryModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
