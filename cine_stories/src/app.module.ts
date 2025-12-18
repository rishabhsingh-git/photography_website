import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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
      useFactory: () => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        autoLoadEntities: true,
        synchronize: true,
      }),
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
  ],
  controllers: [HealthController],
})
export class AppModule {}
