import mongoose from "mongoose";

const portalAnnouncementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 600,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "adminTB",
        default: null,
    },
}, { timestamps: true });

export default mongoose.model("portalAnnouncement", portalAnnouncementSchema);
