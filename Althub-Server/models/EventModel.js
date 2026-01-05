import mongoose from "mongoose";

const event = new mongoose.Schema({
    organizerid: {
        type: String
    },
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    date: {
        type: String,
        default: new Date()
    },
    venue: {
        type: String,
    },
    photos: {
        type: Array
    },
    participants: {
        type: Array,
        default: []
    }
});

export default mongoose.model("EventTB", event);