import type { Document } from 'mongoose';
import { Schema, model } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  pAccountNo?: string;
  pPassword?: string;
  password?: string;
  mobile?: number;
  userType?: string;
  test?: string;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  pAccountNo: {
    type: String,
    trim: true,
  },
  pPassword: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    trim: true,
  },
  mobile: {
    type: Number,
    trim: true,
  },
  userType: {
    type: String,
    trim: true,
  },
  test: {
    type: String,
  },
});

export default model<IUser>('Users', userSchema);
