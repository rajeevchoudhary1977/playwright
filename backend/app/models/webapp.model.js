import mongoose from "mongoose";

import { ENGAGEMENTS } from "../configs/config.js";

const { Schema } = mongoose;

const WebApp = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    tests: [{ type: Schema.Types.ObjectId, ref: 'Test' }],
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    engagement: {
      type: String,
      enum: ENGAGEMENTS,
      default: ENGAGEMENTS.at(0)
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('WebApp', WebApp);