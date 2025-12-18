import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { StorageService } from './storage.service';
import { S3Adapter } from './storage.providers';

@Module({
  imports: [ConfigModule],
  providers: [
    StorageService,
    {
      provide: 'StorageAdapter',
      useClass: S3Adapter,
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
