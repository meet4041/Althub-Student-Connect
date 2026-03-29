import mongoose from "mongoose";

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
<<<<<<< HEAD
    token: { type: String, default: '' },
    // REPLAY PROTECTION: Track session version
    tokenVersion: {
        type: Number,
        default: 0
    }
}, { timestamps: true });
=======
    token: { type: String, default: '', select: false },
    tokenExpires: { type: Date, default: null, select: false },
    
    // Fixed role for this table
    role: { type: String, default: 'institute' },
    
    tokenVersion: { type: Number, default: 0, select: false }
}, { 
    timestamps: true,
    // [CRITICAL FIX] This forces Mongoose to use your EXACT existing collection
    collection: 'institutetb1' 
});
>>>>>>> c94aaa1 (althub main v2)

export default mongoose.model("InstituteTB1", institute);