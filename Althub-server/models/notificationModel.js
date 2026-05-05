import mongoose from "mongoose";

const notification = new mongoose.Schema({
    userid: {
        type: String,
    },
    senderid: {
        type: String
    },
    image: {
        type: String
    },
    msg: {
        type: String
    },
    date: {
        type: String,
        default:new Date()
    },
    title:{
        type:String
    }
});

export default mongoose.model("NotificationTB", notification);