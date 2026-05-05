import mongoose from "mongoose";

const feedback = new mongoose.Schema({
    userid: {
        type: String,
    },
    institute_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InstituteTB1",
        index: true
    },
    name: { 
        type: String, // Name of the person GIVING feedback
    },
    selected_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "usersTB1",
        index: true
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
