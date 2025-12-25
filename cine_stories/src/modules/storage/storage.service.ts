import { Inject, Injectable } from '@nestjs/common';

import { StorageAdapter, StorageUploadResult } from './types';

@Injectable()
export class StorageService {
  constructor(@Inject('StorageAdapter') private readonly adapter: StorageAdapter) {}

  async uploadObject(params: { key: string; buffer: Buffer; mimeType: string }): Promise<StorageUploadResult> {
    return this.adapter.upload(params);
  }

  getSignedUrl(key: string): string {
    return this.adapter.getUrl(key);
  }

  async deleteObject(key: string): Promise<void> {
    return this.adapter.delete(key);
  }
}
