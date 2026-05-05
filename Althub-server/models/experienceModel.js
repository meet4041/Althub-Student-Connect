import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

const experience = new mongoose.Schema({
    userid: { type: String },
    companyname: { type: String },
    position: { type: String },
    joindate: { type: String },
    enddate: { type: String },
    companylogo: { type: String },
    description: { type: String }
});

export default mongoose.model("experienceTB", experience);