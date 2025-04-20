import type { Document } from 'mongoose';
import { Schema, model } from 'mongoose';

export const enum TaskStatus {
  Done = 'Done',
  Running = 'Running',
  Aborted = 'Aborted',
  Failed = 'Failed',
}
export interface ITask extends Document {
  status: string;
  error?: Error;
  type?: string;
  progress?: string | number;
  message?: string;
  pid: number;
  browserPid?: number;
  listData?: Record<string, unknown>;
  agentId?: Schema.Types.ObjectId;
  misc?: unknown;
  globalTimeout?: number;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    status: {
      type: String,
      required: true,
      enum: [TaskStatus.Done, TaskStatus.Running, TaskStatus.Aborted, TaskStatus.Failed],
    },
    error: {
      type: Schema.Types.Mixed,
    },
    type: {
      type: String,
      trim: true,
    },
    progress: {
      type: Schema.Types.Mixed,
    },
    message: {
      type: String,
      trim: true,
    },
    pid: {
      type: Number,
      required: true,
    },
    browserPid: {
      type: Number,
    },
    listData: {
      type: Object,
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    misc: {
      type: Schema.Types.Mixed,
    },
    globalTimeout: {
      type: Number,
    },
  },
  { timestamps: true }
);

export default model<ITask>('Task', taskSchema);
