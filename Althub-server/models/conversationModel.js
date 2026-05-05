import mongoose from "mongoose";

const conversation = new mongoose.Schema(
  {
    members: {
      type: Array,
    },
  },
  { timestamps: true }
);

export default mongoose.model("conversationTB", conversation);