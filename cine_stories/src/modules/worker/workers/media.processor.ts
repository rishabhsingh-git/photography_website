import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('media-tasks')
export class MediaProcessor {
  // critical: heavy CPU tasks (thumbnails/EXIF) must run off main thread
  @Process()
  async handle(job: Job<any>): Promise<void> {
    // placeholder for image processing logic
    console.log('processing media job', job.id, job.data);
  }
}
