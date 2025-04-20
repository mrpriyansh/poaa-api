import type { Document, Types } from 'mongoose';
import { Schema, model } from 'mongoose';

export interface IAccount extends Document {
  name: string;
  accountNo: string;
  accountType: string;
  amount: number;
  openingDate: Date;
  maturityDate: Date;
  agentId: Types.ObjectId;
  mobile?: number;
  cifid: string;
  createdAt: Date;
  updatedAt: Date;
}

const accountSchema = new Schema<IAccount>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    accountNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    accountType: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    openingDate: {
      type: Date,
      required: true,
    },
    maturityDate: {
      type: Date,
      required: true,
    },
    agentId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    mobile: {
      type: Number,
    },
    cifid: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model<IAccount>('Account', accountSchema);
