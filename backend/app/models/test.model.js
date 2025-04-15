import mongoose from "mongoose";

import { TEST_CATEGORIES, TEST_STATUS_OPTS } from "../configs/config.js";

const { Schema } = mongoose;

const Test = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    webApp: { type: Schema.Types.ObjectId, ref: "WebApp" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    category: {
      type: String,
      enum: Object.keys(TEST_CATEGORIES).map((key) => TEST_CATEGORIES[key]),
    },
    config: {
      type: Object,
      default: {},
    },
    status: {
      type: String,
      enum: Object.keys(TEST_STATUS_OPTS).map((key) => TEST_STATUS_OPTS[key]),
    },
    mainUrl: {
      type: mongoose.Schema.Types.Mixed,
    },
    refUrl: {
      type: mongoose.Schema.Types.Mixed,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Test", Test);
