import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { NotificationService } from './notification.service';
import { NotificationProcessor } from './notification.processor';

@Module({
  imports: [
    HttpModule,
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  providers: [NotificationService, NotificationProcessor],
  exports: [NotificationService],
})
export class NotificationModule {}
