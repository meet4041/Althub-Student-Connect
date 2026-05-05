import mongoose from "mongoose";

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

export default mongoose.model("messageTB", message);