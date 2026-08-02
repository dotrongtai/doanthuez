export const STORAGE_PORT = Symbol('STORAGE_PORT');

export interface UploadFileInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  // Logical folder within the bucket/disk, e.g. "avatars".
  folder: string;
}

export interface StoragePort {
  upload(input: UploadFileInput): Promise<{ url: string }>;
}
