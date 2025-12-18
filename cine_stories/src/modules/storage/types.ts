export interface StorageAdapter {
  upload(params: { key: string; buffer: Buffer; mimeType: string }): Promise<string>;
  getUrl(key: string): string;
}
