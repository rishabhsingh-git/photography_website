import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { EventService } from './event.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'domain-events',
    }),
  ],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
