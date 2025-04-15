import mongoose from "mongoose";

const { Schema } = mongoose;

const TestLog = new Schema(
  {
    test: { type: Schema.Types.ObjectId, ref: "Test" },
    logs: {
      type: [{ type: String }]
    }
  }
)

export default mongoose.model("TestLog", TestLog);