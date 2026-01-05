import mongoose from "mongoose";

const education = new mongoose.Schema({
    userid: {
        type: String
    },
    institutename: {
        type: String
    },
    course: {
        type: String
    },
    joindate: {
        type: String
    },
    enddate: {
        type: String
    },
    collagelogo: {
        type: String
    }
});

export default mongoose.model("educationTB", education);