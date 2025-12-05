const mongoose = require("mongoose");

const message = new mongoose.Schema({
    conversationId: {
        type: String,
    },
    sender: {
        type: String,
    },
    text: {
        type: String,
    },
    // --- PERSISTENT READ STATUS ---
    isRead: {
        type: Boolean,
        default: false
    },
    // -----------------------------
    time: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

module.exports = mongoose.model("messageTB", message);