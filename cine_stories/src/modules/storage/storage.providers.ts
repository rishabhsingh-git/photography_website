import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// OCI SDK imports - install with: npm install oci-common oci-objectstorage
// Alternative: npm install oci-sdk (meta-package)
import * as common from 'oci-common';
import * as objectStorage from 'oci-objectstorage';

import { StorageAdapter, StorageUploadResult } from './types';

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

  async upload(params: { key: string; buffer: Buffer; mimeType: string }): Promise<StorageUploadResult> {
    try {
      console.log('☁️ [S3Adapter] Uploading to S3:', {
        key: params.key,
        size: params.buffer.length,
        mimeType: params.mimeType,
        bucket: this.bucket,
      });

      // critical: enforce server-side content type and length to prevent abuse
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: params.key,
          Body: params.buffer,
          ContentType: params.mimeType,
        }),
      );
      
      console.log('✅ [S3Adapter] Upload to S3 successful');
      
      const url = this.getUrl(params.key);
      console.log('🔗 [S3Adapter] Generated URL:', url);
      
      return {
        provider: 's3',
        key: params.key,
        url,
      };
    } catch (error: any) {
      console.error('❌ [S3Adapter] Upload failed:', {
        error: error.message,
        key: params.key,
      });
      throw new Error(`S3 upload failed: ${error.message || 'Unknown error'}`);
    }
  }

  getUrl(key: string): string {
    return `${process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT}/${this.bucket}/${key}`;
  }
}

@Injectable()
export class OracleAdapter implements StorageAdapter {
  private readonly client: objectStorage.ObjectStorageClient;
  private readonly namespace: string;
  private readonly bucket: string;
  private readonly region: string;

  constructor() {
    const region = process.env.OCI_REGION || '';
    const namespace = process.env.OCI_NAMESPACE || '';
    const bucket = process.env.OCI_BUCKET_NAME || '';

    if (!region || !namespace || !bucket) {
      throw new Error('OCI configuration missing: OCI_REGION, OCI_NAMESPACE, and OCI_BUCKET_NAME are required');
    }

    // OCI API signing requires user OCID, fingerprint, private key, and tenancy OCID
    // These should be provided via environment variables for security
    const user = process.env.OCI_USER_OCID || '';
    const fingerprint = process.env.OCI_FINGERPRINT || '';
    // Handle private key: replace literal \n with actual newlines for proper parsing
    const privateKeyRaw = process.env.OCI_PRIVATE_KEY || '';
    const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
    const tenancy = process.env.OCI_TENANCY_OCID || '';
    // Passphrase is optional - only needed if private key is encrypted
    // Convert undefined to null to match OCI SDK type expectations
    const passphrase = process.env.OCI_PRIVATE_KEY_PASSPHRASE || null;

    if (!user || !fingerprint || !privateKey || !tenancy) {
      throw new Error(
        'OCI credentials missing: OCI_USER_OCID, OCI_FINGERPRINT, OCI_PRIVATE_KEY, and OCI_TENANCY_OCID are required'
      );
    }

    // Create authentication provider using API key signing
    const provider = new common.SimpleAuthenticationDetailsProvider(
      tenancy,
      user,
      fingerprint,
      privateKey,
      passphrase,
      common.Region.fromRegionId(region)
    );

    this.client = new objectStorage.ObjectStorageClient({ authenticationDetailsProvider: provider });
    this.namespace = namespace;
    this.bucket = bucket;
    this.region = region;
  }

  async upload(params: { key: string; buffer: Buffer; mimeType: string }): Promise<StorageUploadResult> {
    try {
      console.log('☁️ [OracleAdapter] Uploading to Oracle Cloud:', {
        key: params.key,
        size: params.buffer.length,
        mimeType: params.mimeType,
        namespace: this.namespace,
        bucket: this.bucket,
        region: this.region,
      });

      const putObjectRequest: objectStorage.requests.PutObjectRequest = {
        namespaceName: this.namespace,
        bucketName: this.bucket,
        objectName: params.key,
        putObjectBody: params.buffer,
        contentLength: params.buffer.length,
        contentType: params.mimeType,
      };

      await this.client.putObject(putObjectRequest);
      console.log('✅ [OracleAdapter] Upload to Oracle Cloud successful');

      const url = this.getUrl(params.key);
      console.log('🔗 [OracleAdapter] Generated URL:', url);
      
      return {
        provider: 'oracle',
        key: params.key,
        url,
      };
    } catch (error: any) {
      console.error('❌ [OracleAdapter] Upload failed:', {
        error: error.message,
        code: error.code,
        statusCode: error.statusCode,
        key: params.key,
      });
      throw new Error(`OCI upload failed: ${error.message || 'Unknown error'}`);
    }
  }

  getUrl(key: string): string {
    // URL-encode the object name
    const encodedKey = encodeURIComponent(key);
    // Construct public object URL
    // Format: https://objectstorage.<region>.oraclecloud.com/n/<namespace>/b/<bucket>/o/<object-name>
    return `https://objectstorage.${this.region}.oraclecloud.com/n/${this.namespace}/b/${this.bucket}/o/${encodedKey}`;
  }
}
