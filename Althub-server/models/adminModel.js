import mongoose from "mongoose";

const admin = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // Security: Prevents duplicate admin accounts
    },
    password: {
        type: String,
        required: true,
        select: false // Security: Prevents password from being included in random queries
    },
    profilepic: {
        type: String,
        default: ""
    },
    token: {
        type: String,
        default: ''
    },
    tokenExpires: {
        type: Date,
        default: null
    },
    // --- SECURITY ADDITION: REPLAY PROTECTION ---
    // tracking the current "version" of the user's session.
    // When the password is changed, increment to logout all attackers.
    tokenVersion: {
        type: Number,
        default: 0
    }
}, { timestamps: true }); // Tracks when the account was created/updated

export default mongoose.model("adminTB", admin);
