import { Inject, Injectable } from '@nestjs/common';

import { StorageAdapter } from './types';

@Injectable()
export class StorageService {
  constructor(@Inject('StorageAdapter') private readonly adapter: StorageAdapter) {}

  uploadObject(params: { key: string; buffer: Buffer; mimeType: string }) {
    return this.adapter.upload(params);
  }

  getSignedUrl(key: string) {
    return this.adapter.getUrl(key);
  }
}
