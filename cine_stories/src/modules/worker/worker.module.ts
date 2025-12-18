import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { MediaProcessor } from './workers/media.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'media-tasks',
    }),
  ],
  providers: [MediaProcessor],
})
export class WorkerModule {}
