import mongoose from "mongoose";

const course = new mongoose.Schema({
    instituteid: {
        type: String
    },
    name: {
        type: String,
    },
    stream: {
        type: String,
    },
    duration: {
        type: Number,
    }
});

export default mongoose.model("courseTB", course);