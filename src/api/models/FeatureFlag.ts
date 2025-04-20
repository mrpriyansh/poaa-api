import type { Document } from 'mongoose';
import { Schema, model } from 'mongoose';

export interface IFeatureFlag extends Document {
  active: boolean;
  name: string;
  metaInfo?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const featureFlagSchema = new Schema<IFeatureFlag>(
  {
    active: {
      type: Boolean,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    metaInfo: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

export default model<IFeatureFlag>('featureFlag', featureFlagSchema);
