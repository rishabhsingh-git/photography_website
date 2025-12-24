import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { StorageService } from './storage.service';
import { S3Adapter, OracleAdapter } from './storage.providers';

@Module({
  imports: [ConfigModule],
  providers: [
    StorageService,
    {
      provide: 'StorageAdapter',
      useFactory: () => {
        const provider = process.env.STORAGE_PROVIDER || 's3';
        switch (provider.toLowerCase()) {
          case 'oracle':
            return new OracleAdapter();
          case 's3':
          default:
            return new S3Adapter();
        }
      },
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
