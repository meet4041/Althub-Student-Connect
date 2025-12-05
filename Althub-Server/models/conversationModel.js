const mongoose = require("mongoose");

const conversation = new mongoose.Schema(
  {
    members: {
      type: Array,
    },
  },
  { timestamps: true } // --- ADDED THIS ---
);

module.exports = mongoose.model("conversationTB", conversation);