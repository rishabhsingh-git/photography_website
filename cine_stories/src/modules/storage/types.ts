export interface StorageUploadResult {
  provider: string;
  key: string;
  url: string;
}

export interface StorageAdapter {
  upload(params: { key: string; buffer: Buffer; mimeType: string }): Promise<StorageUploadResult>;
  getUrl(key: string): string;
}
