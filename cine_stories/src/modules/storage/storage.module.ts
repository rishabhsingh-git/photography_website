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
        console.log(`📦 [StorageModule] Initializing storage provider: ${provider}`);
        
        try {
          switch (provider.toLowerCase()) {
            case 'oracle':
              console.log('🔧 [StorageModule] Creating OracleAdapter...');
              const oracleAdapter = new OracleAdapter();
              console.log('✅ [StorageModule] OracleAdapter created successfully');
              return oracleAdapter;
            case 's3':
            default:
              console.log('🔧 [StorageModule] Creating S3Adapter...');
              const s3Adapter = new S3Adapter();
              console.log('✅ [StorageModule] S3Adapter created successfully');
              return s3Adapter;
          }
        } catch (error: any) {
          console.error('❌ [StorageModule] Failed to initialize storage adapter:', {
            provider,
            error: error.message,
            stack: error.stack,
          });
          throw new Error(
            `Failed to initialize ${provider} storage adapter: ${error.message}. ` +
            'Please check your environment variables and configuration.'
          );
        }
      },
    },
  ],
  exports: [StorageService, 'StorageAdapter'], // Export StorageAdapter so it can be injected in other modules
})
export class StorageModule {}
