import { Processor, Process, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';

import { NotificationService } from './notification.service';

@Processor('notifications')
export class NotificationProcessor {
  constructor(private readonly service: NotificationService) {}

  // critical: Processor runs in worker context to keep API responsive
  @Process()
  async handle(job: Job<any>): Promise<void> {
    await this.service.callMicroservice(job.data);
  }

  @OnQueueFailed()
  onFailed(job: Job<any>, error: Error) {
    // log hook for observability pipeline
    console.error(`Notification job failed ${job.id}`, error);
  }
}
