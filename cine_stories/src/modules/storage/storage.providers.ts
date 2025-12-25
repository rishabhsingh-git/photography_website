import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
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

  async delete(key: string): Promise<void> {
    try {
      console.log('🗑️ [S3Adapter] Deleting from S3:', { key, bucket: this.bucket });
      
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      
      console.log('✅ [S3Adapter] Delete from S3 successful');
    } catch (error: any) {
      console.error('❌ [S3Adapter] Delete failed:', {
        error: error.message,
        key,
      });
      throw new Error(`S3 delete failed: ${error.message || 'Unknown error'}`);
    }
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

    // Check basic configuration
    const missingConfig: string[] = [];
    if (!region) missingConfig.push('OCI_REGION');
    if (!namespace) missingConfig.push('OCI_NAMESPACE');
    if (!bucket) missingConfig.push('OCI_BUCKET_NAME');

    if (missingConfig.length > 0) {
      console.error('❌ [OracleAdapter] Missing OCI configuration:', missingConfig.join(', '));
      throw new Error(`OCI configuration missing: ${missingConfig.join(', ')} are required`);
    }

    // OCI API signing requires user OCID, fingerprint, private key, and tenancy OCID
    // These should be provided via environment variables for security
    const user = process.env.OCI_USER_OCID || '';
    const fingerprint = process.env.OCI_FINGERPRINT || '';
    // Handle private key: replace literal \n with actual newlines for proper parsing
    // Also handle cases where the key might have actual newlines (from multi-line env vars)
    let privateKeyRaw = process.env.OCI_PRIVATE_KEY || '';
    
    // Remove surrounding quotes if present
    privateKeyRaw = privateKeyRaw.trim();
    if ((privateKeyRaw.startsWith('"') && privateKeyRaw.endsWith('"')) ||
        (privateKeyRaw.startsWith("'") && privateKeyRaw.endsWith("'"))) {
      privateKeyRaw = privateKeyRaw.slice(1, -1);
    }
    
    // Replace literal \n with actual newlines
    // Also handle cases where newlines might already be present
    let privateKey = privateKeyRaw.replace(/\\n/g, '\n');
    
    // Ensure the key ends with a newline after END marker (some OCI SDK versions require this)
    if (privateKey.includes('END') && !privateKey.endsWith('\n')) {
      privateKey = privateKey + '\n';
    }
    const tenancy = process.env.OCI_TENANCY_OCID || '';
    // Passphrase is optional - only needed if private key is encrypted
    // Convert undefined to null to match OCI SDK type expectations
    const passphrase = process.env.OCI_PRIVATE_KEY_PASSPHRASE || null;

    // Check credentials with detailed error messages
    const missingCredentials: string[] = [];
    if (!user) missingCredentials.push('OCI_USER_OCID');
    if (!fingerprint) missingCredentials.push('OCI_FINGERPRINT');
    if (!privateKey) missingCredentials.push('OCI_PRIVATE_KEY');
    if (!tenancy) missingCredentials.push('OCI_TENANCY_OCID');

    if (missingCredentials.length > 0) {
      console.error('❌ [OracleAdapter] Missing OCI credentials:', missingCredentials.join(', '));
      console.error('❌ [OracleAdapter] Credential check:', {
        hasUser: !!user,
        hasFingerprint: !!fingerprint,
        hasPrivateKey: !!privateKey,
        hasTenancy: !!tenancy,
        privateKeyLength: privateKeyRaw.length,
        privateKeyStartsWith: privateKeyRaw.substring(0, 30),
      });
      throw new Error(
        `OCI credentials missing: ${missingCredentials.join(', ')} are required. Please check your .env file or environment variables.`
      );
    }

    // Validate private key format more thoroughly
    if (!privateKey.includes('BEGIN') || !privateKey.includes('PRIVATE KEY') || !privateKey.includes('END')) {
      console.error('❌ [OracleAdapter] Invalid private key format. Key should start with "-----BEGIN" and end with "-----END"');
      console.error('❌ [OracleAdapter] Private key raw length:', privateKeyRaw.length);
      console.error('❌ [OracleAdapter] Private key raw first 50 chars:', privateKeyRaw.substring(0, 50));
      console.error('❌ [OracleAdapter] Private key raw last 50 chars:', privateKeyRaw.substring(Math.max(0, privateKeyRaw.length - 50)));
      throw new Error(
        'OCI_PRIVATE_KEY format is invalid. The key should include BEGIN and END markers. Make sure to use \\n for newlines in environment variables.'
      );
    }

    // Additional validation: check if private key looks like it has proper structure
    if (privateKey.length < 100) {
      console.error('❌ [OracleAdapter] Private key seems too short. Expected at least 100 characters, got:', privateKey.length);
      throw new Error(
        'OCI_PRIVATE_KEY appears to be too short or improperly formatted. Please verify the key is complete.'
      );
    }

    // Log configuration status (without exposing sensitive data)
    console.log('✅ [OracleAdapter] OCI configuration loaded:', {
      region,
      namespace,
      bucket,
      hasUser: !!user,
      userOcidPrefix: user ? `${user.substring(0, 20)}...` : 'missing',
      hasFingerprint: !!fingerprint,
      fingerprintPrefix: fingerprint ? `${fingerprint.substring(0, 10)}...` : 'missing',
      hasPrivateKey: !!privateKey,
      privateKeyLength: privateKey.length,
      privateKeyStartsWith: privateKey ? privateKey.substring(0, 30) : 'missing',
      privateKeyEndsWith: privateKey ? privateKey.substring(privateKey.length - 30) : 'missing',
      hasTenancy: !!tenancy,
      tenancyOcidPrefix: tenancy ? `${tenancy.substring(0, 20)}...` : 'missing',
      hasPassphrase: !!passphrase,
    });

    try {
      // Validate OCID formats with helpful error messages
      if (!tenancy.startsWith('ocid1.tenancy.')) {
        const detectedType = tenancy.match(/^ocid1\.(\w+)\./)?.[1] || 'unknown';
        throw new Error(
          `Invalid tenancy OCID format. Expected to start with 'ocid1.tenancy.', but got 'ocid1.${detectedType}.'.\n` +
          `This looks like a ${detectedType} OCID, not a tenancy OCID.\n` +
          `To find your Tenancy OCID: OCI Console → Identity → Tenancy Details → OCID\n` +
          `Current value: ${tenancy.substring(0, 50)}...`
        );
      }
      if (!user.startsWith('ocid1.user.')) {
        const detectedType = user.match(/^ocid1\.(\w+)\./)?.[1] || 'unknown';
        throw new Error(
          `Invalid user OCID format. Expected to start with 'ocid1.user.', but got 'ocid1.${detectedType}.'.\n` +
          `This looks like a ${detectedType} OCID, not a user OCID.\n` +
          `To find your User OCID: OCI Console → Identity → Users → [Your User] → OCID\n` +
          `Current value: ${user.substring(0, 50)}...\n` +
          `NOTE: Do NOT use bucket OCID, namespace, or any other OCID - only the USER OCID.`
        );
      }
      
      // Validate fingerprint format (should be colon-separated hex pairs)
      const fingerprintPattern = /^([0-9a-f]{2}:){15}[0-9a-f]{2}$/i;
      if (!fingerprintPattern.test(fingerprint)) {
        throw new Error(`Invalid fingerprint format. Expected format: aa:bb:cc:dd:ee:ff:00:11:22:33:44:55:66:77:88:99, got: ${fingerprint}`);
      }

      // Validate private key is a valid RSA key
      if (!privateKey.includes('BEGIN RSA PRIVATE KEY') && !privateKey.includes('BEGIN PRIVATE KEY')) {
        throw new Error('Private key must be an RSA private key in PEM format');
      }

      // Create Region object
      let regionObj: common.Region;
      try {
        regionObj = common.Region.fromRegionId(region);
        console.log('✅ [OracleAdapter] Region validated:', regionObj.regionId);
      } catch (regionError: any) {
        throw new Error(`Invalid OCI region: ${region}. Error: ${regionError.message}`);
      }

      // Create authentication provider using API key signing
      // Parameter order: tenancy, user, fingerprint, privateKey, passphrase, region
      console.log('🔧 [OracleAdapter] Creating authentication provider...');
      const provider = new common.SimpleAuthenticationDetailsProvider(
        tenancy,
        user,
        fingerprint,
        privateKey,
        passphrase,
        regionObj
      );

      console.log('✅ [OracleAdapter] Authentication provider created');

      // Create Object Storage client
      this.client = new objectStorage.ObjectStorageClient({ authenticationDetailsProvider: provider });
      this.namespace = namespace;
      this.bucket = bucket;
      this.region = region;
      
      console.log('✅ [OracleAdapter] OCI client initialized successfully');
    } catch (error: any) {
      console.error('❌ [OracleAdapter] Failed to initialize OCI client:', {
        error: error.message,
        stack: error.stack,
        errorType: error.constructor.name,
      });
      throw new Error(`Failed to initialize OCI client: ${error.message || 'Unknown error'}`);
    }
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

      // Verify client is initialized
      if (!this.client) {
        throw new Error('OCI client is not initialized. Check startup logs for initialization errors.');
      }

      const putObjectRequest: objectStorage.requests.PutObjectRequest = {
        namespaceName: this.namespace,
        bucketName: this.bucket,
        objectName: params.key,
        putObjectBody: params.buffer,
        contentLength: params.buffer.length,
        contentType: params.mimeType,
      };

      console.log('📤 [OracleAdapter] Sending putObject request to OCI...');
      const startTime = Date.now();
      
      await this.client.putObject(putObjectRequest);
      
      const duration = Date.now() - startTime;
      console.log(`✅ [OracleAdapter] Upload completed in ${duration}ms`);
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
        statusMessage: error.statusMessage,
        key: params.key,
        serviceCode: error.serviceCode,
        opcRequestId: error.opcRequestId,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });

      // Provide more helpful error messages for common authentication issues
      if (error.statusCode === 401 || error.message?.includes('authentication') || error.message?.includes('not provided')) {
        console.error('❌ [OracleAdapter] Authentication error detected. Please verify:');
        console.error('  1. OCI_TENANCY_OCID is correct and matches your tenancy');
        console.error('  2. OCI_USER_OCID is correct and matches the user with the API key');
        console.error('  3. OCI_FINGERPRINT exactly matches the API key fingerprint in OCI console');
        console.error('  4. OCI_PRIVATE_KEY is the PRIVATE key (not public) that matches the fingerprint');
        console.error('  5. OCI_PRIVATE_KEY uses \\n for newlines (not actual newlines)');
        console.error('  6. The API key is properly added to the user in OCI console');
        console.error('  7. The user has proper IAM permissions for Object Storage');
        console.error('  8. The bucket exists and is accessible in the specified namespace');
        
        // Additional diagnostic info
        const diagnosticInfo = {
          hasClient: !!this.client,
          namespace: this.namespace,
          bucket: this.bucket,
          region: this.region,
          errorDetails: {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
            serviceCode: error.serviceCode,
          },
        };
        console.error('❌ [OracleAdapter] Diagnostic info:', diagnosticInfo);
        
        throw new Error(
          `OCI authentication failed: ${error.message || 'The required information to complete authentication was not provided'}. ` +
          'Please verify: 1) OCI_TENANCY_OCID, 2) OCI_USER_OCID, 3) OCI_FINGERPRINT matches API key, 4) OCI_PRIVATE_KEY is correct private key with \\n for newlines, 5) API key is added to user in OCI console, 6) User has Object Storage permissions.'
        );
      }

      // Handle other common errors
      if (error.statusCode === 404) {
        throw new Error(`OCI bucket or namespace not found. Verify OCI_BUCKET_NAME (${this.bucket}) and OCI_NAMESPACE (${this.namespace}) are correct.`);
      }

      if (error.statusCode === 403) {
        throw new Error(`OCI access forbidden. Verify the user has permissions to write to bucket ${this.bucket} in namespace ${this.namespace}.`);
      }

      throw new Error(`OCI upload failed: ${error.message || 'Unknown error'} (Status: ${error.statusCode || 'N/A'})`);
    }
  }

  getUrl(key: string): string {
    // URL-encode the object name
    const encodedKey = encodeURIComponent(key);
    // Construct public object URL
    // Format: https://objectstorage.<region>.oraclecloud.com/n/<namespace>/b/<bucket>/o/<object-name>
    return `https://objectstorage.${this.region}.oraclecloud.com/n/${this.namespace}/b/${this.bucket}/o/${encodedKey}`;
  }

  async delete(key: string): Promise<void> {
    try {
      console.log('🗑️ [OracleAdapter] Deleting from Oracle Cloud:', {
        key,
        namespace: this.namespace,
        bucket: this.bucket,
        region: this.region,
      });

      if (!this.client) {
        throw new Error('OCI client is not initialized. Check startup logs for initialization errors.');
      }

      const deleteObjectRequest: objectStorage.requests.DeleteObjectRequest = {
        namespaceName: this.namespace,
        bucketName: this.bucket,
        objectName: key,
      };

      console.log('📤 [OracleAdapter] Sending deleteObject request to OCI...');
      const startTime = Date.now();
      
      await this.client.deleteObject(deleteObjectRequest);
      
      const duration = Date.now() - startTime;
      console.log(`✅ [OracleAdapter] Delete completed in ${duration}ms`);
      console.log('✅ [OracleAdapter] Delete from Oracle Cloud successful');
    } catch (error: any) {
      console.error('❌ [OracleAdapter] Delete failed:', {
        error: error.message,
        code: error.code,
        statusCode: error.statusCode,
        key,
      });

      // Handle 404 (object not found) - this is okay, object is already deleted
      if (error.statusCode === 404) {
        console.log('⚠️ [OracleAdapter] Object not found (may already be deleted):', key);
        return; // Don't throw error if object doesn't exist
      }

      if (error.statusCode === 403) {
        throw new Error(`OCI access forbidden. Verify the user has permissions to delete from bucket ${this.bucket} in namespace ${this.namespace}.`);
      }

      throw new Error(`OCI delete failed: ${error.message || 'Unknown error'} (Status: ${error.statusCode || 'N/A'})`);
    }
  }
}
