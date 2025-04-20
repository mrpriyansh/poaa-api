import type { Document, Types } from 'mongoose';
import { Schema, model } from 'mongoose';

interface ListItem {
  accountNo: string;
  name: string;
  amount: number;
}

export interface IList extends Document {
  list: ListItem[];
  agentId: Types.ObjectId;
  status: string;
  taskId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export enum ListStatus {
  LIST_CREATED = 'LIST_CREATED', // When the list is created but not yet processed with the Post office
  REFERENCE_NO_CREATED = 'REFERENCE_NO_CREATED', // When the list is processed and a reference number is created
}

const ListItemSchema = new Schema<ListItem>(
  {
    accountNo: {
      type: String,
      required: [true, 'Account number is required within list item'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required within list item'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required within list item'],
    },
  },
  { _id: false }
); // Common choice: prevent Mongoose from adding _id to subdocuments in the array

const listSchema = new Schema<IList>(
  {
    list: {
      type: [ListItemSchema], // Use the defined sub-schema within array brackets
      required: true,
      // You can add validation for the array itself, e.g., minimum/maximum length
      validate: {
        validator: (v: ListItem[]) => Array.isArray(v) && v.length > 0,
        message: 'List array cannot be empty',
      },
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: 'Agent',
      required: [true, 'Agent ID is required'],
    },
    status: {
      type: String,
      enum: [ListStatus.LIST_CREATED, ListStatus.REFERENCE_NO_CREATED],
      required: [true, 'Status is required'],
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
    },
  },
  {
    timestamps: true,
  }
);

export default model<IList>('List', listSchema);
