import type { Document } from 'mongoose';
import { Schema, model } from 'mongoose';

interface ISubscription extends Document {
  endpoint: string;
  expirationTime?: number;
  keys: {
    auth: string;
    p256dh: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    endpoint: { type: String, unique: true, required: true },
    expirationTime: { type: Number },
    keys: {
      auth: String,
      p256dh: String,
    },
  },
  {
    timestamps: true,
  }
);

export default model<ISubscription>('subscription', subscriptionSchema);
