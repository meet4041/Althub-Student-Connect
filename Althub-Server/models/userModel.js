import mongoose from "mongoose";

const user = new mongoose.Schema({
    fname: { type: String },
    lname: { type: String },
    gender: { type: String },
    dob: { type: Date },
    city: { type: String },
    state: { type: String },
    nation: { type: String },
    profilepic: { type: String, default: "" },
    phone: { type: String },
    email: { type: String },
    password: { type: String, select: false },
    languages: { type: String },
    github: { type: String },
    portfolioweb: { type: String },
    skills: { type: String },
    followers: { type: Array, default: [] },
    followings: { type: Array, default: [] },
    role: { type: String, default: "student" },
    about: { type: String, default: '' },
    institute: { type: String },
    isOnline: { type: Boolean, default: false },
    socketId: { type: String, default: "" },
    lastSeen: { type: Date, default: Date.now },
    token: { type: String, default: '', select: false },
    tokenExpires: { type: Date, default: null, select: false },
    tokenVersion: { type: Number, default: 0, select: false }
});

user.index({ fname: 'text', lname: 'text', skills: 'text' });

export default mongoose.model("usersTB1", user);
