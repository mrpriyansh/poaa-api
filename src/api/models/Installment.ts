import type { Document, Types } from 'mongoose';
import { Schema, model } from 'mongoose';

export interface IInstallment extends Document {
  accountNo: string;
  name: string;
  amount: number;
  agentId: Types.ObjectId;
  installments: number;
  status: string;
  listedOn?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum InstallmentStatus {
  PENDING = 'PENDING', // Till the installment is not considered for listing
  LOGGED = 'LOGGED', // When the installment is used to create a list
}

const installmentSchema = new Schema<IInstallment>(
  {
    accountNo: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    agentId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    installments: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [InstallmentStatus.PENDING, InstallmentStatus.LOGGED],
      required: true,
    },
    listedOn: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default model<IInstallment>('Installment', installmentSchema);
