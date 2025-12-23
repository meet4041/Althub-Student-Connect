const mongoose = require("mongoose");

const institute = new mongoose.Schema({
    name: { type: String },
    address: { type: String },
    phone: { type: String },
    email: { 
        type: String, 
        unique: true // Security: Prevent duplicate emails
    },
    password: { 
        type: String,
        select: false // HARDENING: Hide password from default queries
    },
    website: { type: String },
    image: { type: String },
    active: { type: Boolean, default: false },
    token: { type: String, default: '' },
    // REPLAY PROTECTION: Track session version
    tokenVersion: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model("InstituteTB1", institute);