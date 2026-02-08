import mongoose from "mongoose";

const instituteSchema = new mongoose.Schema({
    name: { type: String, required: [true, "Name is required"] },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String },
    address: { type: String },
    website: { type: String },
    image: { type: String },
    active: { type: Boolean, default: false },
    token: { type: String, default: '' },
    
    // Fixed role for this table
    role: { type: String, default: 'institute' },
    
    tokenVersion: { type: Number, default: 0 }
}, { 
    timestamps: true,
    // [CRITICAL FIX] This forces Mongoose to use your EXACT existing collection
    collection: 'institutetb1' 
});

export default mongoose.models.InstituteTB1 || mongoose.model("InstituteTB1", instituteSchema);