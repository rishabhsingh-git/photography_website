import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { NotificationChannel } from '../../infrastructure/database/entities/notification.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  constructor(
    private readonly http: HttpService,
    @InjectQueue('notifications') private readonly queue: Queue,
  ) {}

  async enqueue(channel: NotificationChannel, payload: Record<string, any>) {
    // critical: queue heavy notification delivery to avoid blocking web threads
    await this.queue.add(`notify:${channel}`, { channel, payload }, { attempts: 3, backoff: 5000 });
  }

  async callMicroservice(body: any) {
    try {
      await this.http.axiosRef.post(`${process.env.NOTIFICATION_BASE_URL}/deliver`, body);
    } catch (err) {
      this.logger.error('Notification microservice call failed', err as Error);
      throw err;
    }
  }
}
