import mongoose from "mongoose";

const placementSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String },
    image: { type: String },

    // Link to the Main Institute
    parent_institute_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstituteTB1',
        required: true
    },
    
    role: { type: String, default: 'placement_cell' },
    active: { type: Boolean, default: false },
    
    // [CRITICAL FIX] Added 'token' field to match Institute Schema
    token: { type: String, default: '', select: false },
    tokenExpires: { type: Date, default: null, select: false },
    
    tokenVersion: { type: Number, default: 0, select: false }
}, { timestamps: true });

export default mongoose.model("PlacementCell", placementSchema);
