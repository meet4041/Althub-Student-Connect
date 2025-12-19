const mongoose = require("mongoose");

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
    // --- SECURITY ADDITION: REPLAY PROTECTION ---
    // This tracks the current "version" of the user's session.
    // When the password is changed, we increment this to logout all attackers.
    tokenVersion: {
        type: Number,
        default: 0
    }
}, { timestamps: true }); // Tracks when the account was created/updated

module.exports = mongoose.model("adminTB", admin);