import mongoose from "mongoose";

const placementSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String },

    // Link to the Main Institute
    parent_institute_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'institutetb1',
        required: true
    },
    
    role: { type: String, default: 'placement_cell' },
    active: { type: Boolean, default: false },
    
    // [CRITICAL FIX] Added 'token' field to match Institute Schema
    token: { type: String, default: '' },
    
    tokenVersion: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("PlacementCell", placementSchema);