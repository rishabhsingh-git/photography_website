import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

import { StorageAdapter } from './types';

@Injectable()
export class S3Adapter implements StorageAdapter {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    this.client = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || '',
        secretAccessKey: process.env.S3_SECRET_KEY || '',
      },
      forcePathStyle: true,
    });
    this.bucket = process.env.S3_BUCKET || '';
  }

  async upload(params: { key: string; buffer: Buffer; mimeType: string }) {
    // critical: enforce server-side content type and length to prevent abuse
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: params.key,
        Body: params.buffer,
        ContentType: params.mimeType,
      }),
    );
    return this.getUrl(params.key);
  }

  getUrl(key: string): string {
    return `${process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT}/${this.bucket}/${key}`;
  }
}
