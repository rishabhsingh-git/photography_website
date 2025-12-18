import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class EventService {
  constructor(@InjectQueue('domain-events') private readonly queue: Queue) {}

  async publish(name: string, payload: Record<string, any>) {
    // critical: durable event publishing for cross-service integration
    await this.queue.add(name, payload, { attempts: 3, backoff: 2000 });
  }
}
