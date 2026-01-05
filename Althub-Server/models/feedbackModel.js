import mongoose from "mongoose";

const feedback = new mongoose.Schema({
    userid: {
        type: String,
    },
    name: { 
        type: String, // Name of the person GIVING feedback
    },
    selected_user: {
        type: String, // Name of the person BEING REVIEWED (New Field)
    },
    message: {
        type: String,
    },
    rate: {
        type: Number,
        default: 0
    }
});

export default mongoose.model("FeedbackTB", feedback);