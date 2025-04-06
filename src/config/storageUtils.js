const { Storage } = require('@google-cloud/storage');

// Initialize the storage client.
const storage = new Storage({
  keyFilename: './gcloud.json',
}).bucket(process.env.BUCKET_NAME);

const uploadFile = async (fileName, option) => {
  const file = await storage.upload(fileName, {
    ...option,
  });
  return file;
};

module.exports = { storageUtil: storage, uploadFile };
