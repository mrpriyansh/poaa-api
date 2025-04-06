import { Storage, Bucket, UploadOptions } from "@google-cloud/storage";

// Initialize the storage client.
const storage: Bucket = new Storage({
  keyFilename: "./gcloud.json",
}).bucket(process.env.BUCKET_NAME || "");

const uploadFile = async (
  fileName: string,
  option?: UploadOptions
): Promise<any> => {
  const file = await storage.upload(fileName, {
    ...option,
  });
  return file;
};

export { storage as storageUtil, uploadFile };