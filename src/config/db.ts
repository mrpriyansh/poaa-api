import mongoose from 'mongoose';
import config from './config';

const db: string = config.mongoURI + (process.env.NODE_ENV === 'production' ? '' : '-dev');

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(db);
    console.info('MongoDB Connected...', db);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error('An unknown error occurred during DB connection.');
    }
    process.exit(1);
  }
};

export default connectDB;
