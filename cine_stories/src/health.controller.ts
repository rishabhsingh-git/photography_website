import { Controller, Get, UseGuards, Post } from '@nestjs/common';
import { AdminGuard } from './modules/auth/guards/admin.guard';
import { StorageService } from './modules/storage/storage.service';

@Controller()
export class HealthController {
  constructor(
    private readonly storageService: StorageService,
  ) {}

  // GET /api
  @Get()
  getRoot() {
    return { message: 'Hello Nest API' };
  }

  // GET /api/health
  @Get('health')
  getHealth() {
    return { status: 'ok' };
  }

  // GET /api/health/storage - Diagnostic endpoint for storage configuration
  @Get('health/storage')
  @UseGuards(AdminGuard)
  async getStorageHealth() {
    const provider = process.env.STORAGE_PROVIDER || 's3';
    const config: any = {
      provider,
      configured: true,
    };

    if (provider === 'oracle') {
      const hasTenancy = !!process.env.OCI_TENANCY_OCID;
      const hasUser = !!process.env.OCI_USER_OCID;
      const hasFingerprint = !!process.env.OCI_FINGERPRINT;
      const hasPrivateKey = !!process.env.OCI_PRIVATE_KEY;
      const hasRegion = !!process.env.OCI_REGION;
      const hasNamespace = !!process.env.OCI_NAMESPACE;
      const hasBucket = !!process.env.OCI_BUCKET_NAME;

      const privateKeyRaw = process.env.OCI_PRIVATE_KEY || '';
      const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
      const isValidKeyFormat = privateKey.includes('BEGIN') && 
                               privateKey.includes('PRIVATE KEY') && 
                               privateKey.includes('END');

      config.oracle = {
        hasTenancy,
        hasUser,
        hasFingerprint,
        hasPrivateKey,
        hasRegion,
        hasNamespace,
        hasBucket,
        privateKeyLength: privateKeyRaw.length,
        privateKeyFormatValid: isValidKeyFormat,
        region: process.env.OCI_REGION || 'not set',
        namespace: process.env.OCI_NAMESPACE || 'not set',
        bucket: process.env.OCI_BUCKET_NAME || 'not set',
        allConfigured: hasTenancy && hasUser && hasFingerprint && hasPrivateKey && hasRegion && hasNamespace && hasBucket,
      };

      if (!config.oracle.allConfigured) {
        config.configured = false;
        config.missing = [];
        if (!hasTenancy) config.missing.push('OCI_TENANCY_OCID');
        if (!hasUser) config.missing.push('OCI_USER_OCID');
        if (!hasFingerprint) config.missing.push('OCI_FINGERPRINT');
        if (!hasPrivateKey) config.missing.push('OCI_PRIVATE_KEY');
        if (!hasRegion) config.missing.push('OCI_REGION');
        if (!hasNamespace) config.missing.push('OCI_NAMESPACE');
        if (!hasBucket) config.missing.push('OCI_BUCKET_NAME');
      }

      if (!isValidKeyFormat && hasPrivateKey) {
        config.configured = false;
        config.error = 'Private key format is invalid. Must include BEGIN and END markers.';
      }
    } else {
      config.s3 = {
        endpoint: process.env.S3_ENDPOINT || 'not set',
        region: process.env.S3_REGION || 'not set',
        bucket: process.env.S3_BUCKET || 'not set',
        hasAccessKey: !!process.env.S3_ACCESS_KEY,
        hasSecretKey: !!process.env.S3_SECRET_KEY,
      };
    }

    return config;
  }

  // POST /api/health/storage/test - Test OCI authentication with a small upload
  @Post('health/storage/test')
  @UseGuards(AdminGuard)
  async testStorageUpload() {
    const provider = process.env.STORAGE_PROVIDER || 's3';
    
    if (provider !== 'oracle') {
      return { 
        success: false, 
        message: 'Storage provider is not Oracle. Test endpoint only works for Oracle.' 
      };
    }

    try {
      // Create a small test file (1 byte)
      const testBuffer = Buffer.from('T');
      const testKey = `test/health-check-${Date.now()}.txt`;

      console.log('🧪 [HealthController] Testing OCI upload with test file...');
      
      const result = await this.storageService.uploadObject({
        key: testKey,
        buffer: testBuffer,
        mimeType: 'text/plain',
      });

      console.log('✅ [HealthController] OCI test upload successful:', result);

      return {
        success: true,
        message: 'OCI authentication and upload test successful',
        result: {
          provider: result.provider,
          key: result.key,
          url: result.url,
        },
      };
    } catch (error: any) {
      console.error('❌ [HealthController] OCI test upload failed:', error);
      return {
        success: false,
        message: 'OCI authentication test failed',
        error: error.message,
        details: error.stack,
      };
    }
  }
}
