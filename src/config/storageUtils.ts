import type { Bucket, UploadOptions, UploadResponse } from '@google-cloud/storage';
import { Storage } from '@google-cloud/storage';

// Initialize the storage client.
const storage: Bucket = new Storage({
  keyFilename: './gcloud.json',
}).bucket(process.env.BUCKET_NAME || '');

const uploadFile = async (fileName: string, option?: UploadOptions): Promise<UploadResponse> => {
  const file = await storage.upload(fileName, {
    ...option,
  });
  return file;
};

export { storage as storageUtil, uploadFile };
