const User = require("../models/userModel");
const Education = require("../models/educationModel"); 
const bcryptjs = require("bcryptjs");
const config = require("../config/config");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const cookieParser = require("cookie-parser");
const mongoose = require('mongoose');

// --- HELPER FUNCTIONS ---

const sendresetpasswordMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        });
        const mailoptions = {
            from: config.emailUser,
            to: email,
            subject: 'For Reset Password',
            html: '<p>Hello ' + name + ', Please copy the link to <a href="http://localhost:3000/new-password?token=' + token + '">reset your password</a></p>'
        };
        return new Promise((resolve, reject) => {
            transporter.sendMail(mailoptions, function (error, info) {
                if (error) { console.log("Error sending email: ", error); reject(error); }
                else { console.log("Mail sent: ", info.response); resolve(info); }
            });
        });
    } catch (error) {
        console.log("Nodemailer error:", error.message);
        throw error;
    }
}

const createtoken = async (id) => {
    try { return jwt.sign({ _id: id }, config.secret_jwt); } catch (error) { throw new Error(error.message); }
}

const securePassword = async (password) => {
    try { return await bcryptjs.hash(password, 10); } catch (error) { throw new Error(error.message); }
}

const checkAlumniStatus = (educations) => {
    if (!educations || educations.length === 0) return false;
    const isStudying = educations.some(edu => !edu.enddate || edu.enddate === "");
    if (isStudying) return false;
    let maxYear = 0;
    educations.forEach(edu => {
        const d = new Date(edu.enddate);
        if (!isNaN(d.getTime()) && d.getFullYear() > maxYear) maxYear = d.getFullYear();
    });
    const cutoffDate = new Date(maxYear, 4, 15);
    return new Date() > cutoffDate;
};

const getLatestEducation = (educations) => {
    if (!educations || educations.length === 0) return { course: "", year: "" };
    // Sort by enddate descending (latest first)
    const sorted = educations.sort((a, b) => {
        const dateA = new Date(a.enddate || "1900-01-01");
        const dateB = new Date(b.enddate || "1900-01-01");
        return dateB - dateA;
    });
    const latest = sorted[0];
    const year = latest.enddate ? new Date(latest.enddate).getFullYear() : "";
    return { course: latest.course, year: year.toString() };
};

const createFlexibleRegex = (text) => {
    if (!text) return null;
    const clean = text.replace(/[\W_]+/g, ""); 
    const pattern = clean.split('').join('[\\W_]*');
    return new RegExp(pattern, "i");
};

// --- CONTROLLERS ---

const registerUser = async (req, res) => {
    try {
        const spassword = await securePassword(req.body.password);
        const user = new User({
            fname: req.body.fname, lname: req.body.lname, gender: req.body.gender,
            dob: req.body.dob, city: req.body.city, state: req.body.state,
            nation: req.body.nation, profilepic: req.body.profilepic, phone: req.body.phone,
            email: req.body.email, password: spassword, languages: req.body.languages,
            github: req.body.github, portfolioweb: req.body.portfolioweb, skills: req.body.skills,
            institute: req.body.institute, role: req.body.role,
        });
        const userData = await User.findOne({ email: req.body.email });
        if (userData) { res.status(400).send({ success: false, msg: "User already exists" }); }
        else {
            const token = await createtoken();
            const user_data = await user.save();
            res.status(200).send({ success: true, data: user_data, token: token });
        }
    } catch (error) { res.status(400).send(error.message); }
}

const userlogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });
        if (userData) {
            const passwordMatch = await bcryptjs.compare(password, userData.password);
            if (passwordMatch) {
                const { password, ...userResult } = userData._doc;
                res.status(200).send({ success: true, msg: "user details", data: userResult });
            } else { res.status(400).send({ success: false, msg: "Incorrect password" }); }
        } else { res.status(400).send({ success: false, msg: "User not found" }); }
    } catch (error) { res.status(400).send(error.message); }
}

const uploadUserImage = async (req, res) => {
    try {
        if (req.file !== undefined) {
            const picture = { url: '/userImages/' + req.file.filename };
            res.status(200).send({ success: true, data: picture });
        } else { res.status(400).send({ success: false, msg: "plz select a file" }); }
    } catch (error) { res.status(400).send(error.message); }
}
const updatePassword = async (req, res) => {
    try {
        const user_id = req.body.user_id;
        const data = await User.findOne({ _id: user_id });
        if (data) {
            const passwordMatch = await bcryptjs.compare(req.body.oldpassword, data.password);
            if (passwordMatch) {
                const newpassword = await securePassword(req.body.newpassword);
                const userData = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: newpassword } }, { new: true });
                res.status(200).send({ success: true, msg: "Your password has been updated", data: userData });
            } else { res.status(400).send({ success: false, msg: "Old password is incorrect" }); }
        } else { res.status(400).send({ success: false, msg: "User not found!" }); }
    } catch (error) { res.status(400).send(error.message); }
}
const forgetPassword = async (req, res) => {
    try {
        const email = req.body.email;
        const userData = await User.findOne({ email: email });
        if (userData) {
            const randomString = randomstring.generate();
            await User.updateOne({ email: email }, { $set: { token: randomString } });
            await sendresetpasswordMail(userData.fname, userData.email, randomString);
            res.status(200).send({ success: true, msg: "Check inbox to reset password" });
        } else { res.status(200).send({ success: false, msg: "Email does not exist!" }); }
    } catch (error) { res.status(500).send({ success: false, msg: "Failed to send email." }); }
}
const resetpassword = async (req, res) => {
    try {
        const token = req.query.token;
        const tokenData = await User.findOne({ token: token });
        if (tokenData) {
            const newpassword = await securePassword(req.body.password);
            const userData = await User.findByIdAndUpdate({ _id: tokenData._id }, { $set: { password: newpassword, token: '' } }, { new: true });
            res.status(200).send({ success: true, msg: "Password reset successful", data: userData });
        } else { res.status(200).send({ success: false, msg: "Invalid or expired link" }); }
    } catch (error) { res.status(400).send({ success: false, msg: error.message }); }
}
const userProfileEdit = async (req, res) => {
    try {
        const new_data = await User.findByIdAndUpdate({ _id: req.body.id }, { $set: req.body }, { new: true });
        res.status(200).send({ success: true, msg: 'Profile Updated', data: new_data });
    } catch (error) { res.status(400).send({ success: false, msg: error.message }); }
}
const deleteUser = async (req, res) => {
    try {
        await User.deleteOne({ _id: req.params.id });
        res.status(200).send({ success: true, msg: 'Deleted successfully' });
    } catch (error) { res.status(400).send({ success: false, msg: error.message }); }
}

// --- OPTIMIZED ADVANCED SEARCH ---
const searchUser = async (req, res) => {
    try {
        const { search, location, skill, degree, year } = req.body;

        let educationUserIds = null;

        if (degree || year) {
            const eduQuery = {};
            if (degree) {
                eduQuery.course = { $regex: createFlexibleRegex(degree) };
            }
            if (year) {
                eduQuery.enddate = { $regex: new RegExp(year.toString()) };
            }
            educationUserIds = await Education.find(eduQuery).distinct('userid');
            
            if (educationUserIds.length === 0) {
                return res.status(200).send({ success: true, msg: 'No User Found', data: [] });
            }
        }

        const pipeline = [];
        const matchStage = {};

        if (educationUserIds !== null) {
            const objectIds = educationUserIds.map(id => new mongoose.Types.ObjectId(id));
            matchStage._id = { $in: objectIds };
        }

        if (search) {
            const nameRegex = new RegExp(search, "i");
            matchStage.$or = [
                { fname: { $regex: nameRegex } },
                { lname: { $regex: nameRegex } }
            ];
        }

        if (location) {
            const locRegex = new RegExp(location, "i");
            const locQuery = { $or: [{ city: { $regex: locRegex } }, { state: { $regex: locRegex } }] };
            if (matchStage.$or) {
                matchStage.$and = [ { $or: matchStage.$or }, locQuery ];
                delete matchStage.$or; 
            } else {
                Object.assign(matchStage, locQuery);
            }
        }

        if (skill) {
            matchStage.skills = { $regex: new RegExp(skill, "i") };
        }

        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

        pipeline.push({ $limit: 50 });

        // --- FIXED LOOKUP: Uses the correct collection name dynamically ---
        pipeline.push({
            $lookup: {
                from: Education.collection.name, // Dynamically gets 'educationtbs' (or whatever it is)
                let: { userId: "$_id" },
                pipeline: [
                    { 
                        $match: { 
                            $expr: { $eq: ["$userid", { $toString: "$$userId" }] } 
                        }
                    },
                    { $project: { course: 1, enddate: 1 } }
                ],
                as: "educationList"
            }
        });

        pipeline.push({
            $project: {
                fname: 1, lname: 1, profilepic: 1, city: 1, state: 1,
                followers: 1, github: 1, portfolioweb: 1, skills: 1,
                educationList: 1
            }
        });

        const user_data = await User.aggregate(pipeline);

        // --- FORMAT DATA ---
        const finalData = user_data.map(user => {
            const isAlumni = checkAlumniStatus(user.educationList);
            const latestEdu = getLatestEducation(user.educationList);
            delete user.educationList;
            
            return { 
                ...user, 
                isAlumni,
                latestCourse: latestEdu.course,
                latestYear: latestEdu.year
            };
        });

        if (finalData.length > 0) {
            res.status(200).send({ success: true, msg: "User Details", data: finalData });
        } else {
            res.status(200).send({ success: true, msg: 'No User Found', data: [] });
        }

    } catch (error) {
        console.error("Search Error:", error);
        res.status(400).send({ success: false, msg: error.message });
    }
}

const searchUserById = async (req, res) => {
    try {
        const id = req.params._id;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).send({ success: false });
        const user = await User.find({ _id: id }).lean();
        return res.status(200).send({ success: true, data: user });
    } catch (error) { res.status(500).send({ success: false, msg: error.message }); }
}
const userLogout = async (req, res) => {
    try { res.clearCookie("jwt_token"); res.status(200).send({ success: true, msg: "Logged Out" }); } 
    catch (error) { res.status(400).send({ success: false }); }
}
const getUsers = async (req, res) => {
    try { const data = await User.find({}).lean(); res.status(200).send({ success: true, data: data }); }
    catch (error) { res.status(400).send({ success: false }); }
}
const getTopUsers = async (req, res) => {
    try { const data = await User.find({ institute: req.body.institute }).limit(5); res.status(200).send({ success: true, data: data }); }
    catch (error) { res.status(400).send({ success: false }); }
}
const getUsersOfInstitute = async (req, res) => {
    try { const data = await User.find({ institute: req.params.institute }).lean(); res.status(200).send({ success: true, data: data }); }
    catch (error) { res.status(400).send({ success: false }); }
}
const followUser = async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if (!user.followers.includes(req.body.userId)) {
                await user.updateOne({ $push: { followers: req.body.userId } });
                await currentUser.updateOne({ $push: { followings: req.params.id } });
                res.status(200).json("followed");
            } else { res.status(403).json("already follow"); }
        } catch (err) { res.status(500).json(err); }
    } else { res.status(403).json("cant follow self"); }
};
const unfollowUser = async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if (user.followers.includes(req.body.userId)) {
                await user.updateOne({ $pull: { followers: req.body.userId } });
                await currentUser.updateOne({ $pull: { followings: req.params.id } });
                res.status(200).json("unfollowed");
            } else { res.status(403).json("dont follow user"); }
        } catch (err) { res.status(500).json(err); }
    } else { res.status(403).json("cant unfollow self"); }
};
const updateProfilePic = async (req, res) => {
    try {
        const fileId = req.file.id || req.file._id || (req.file.fileId && req.file.fileId.toString());
        const updatedUser = await User.findByIdAndUpdate(req.body.userid, { $set: { profilepic: `/api/images/${fileId}` } }, { new: true });
        res.status(200).send({ success: true, msg: "Profile updated", data: updatedUser });
    } catch (error) { res.status(500).send({ success: false, msg: error.message }); }
};
const deleteProfilePic = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: { profilepic: "" } }, { new: true });
        res.status(200).send({ success: true, msg: "Profile removed", data: updatedUser });
    } catch (error) { res.status(500).send({ success: false, msg: error.message }); }
};
const getRandomUsers = async (req, res) => {
    try {
        const currentUserId = req.body.userid;
        let excludedIds = [];
        if (currentUserId && mongoose.Types.ObjectId.isValid(currentUserId)) {
            const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);
            excludedIds.push(currentUserObjectId);
            const currentUser = await User.findById(currentUserId);
            if (currentUser && currentUser.followings) {
                excludedIds = excludedIds.concat(currentUser.followings.map(id => new mongoose.Types.ObjectId(id)));
            }
        }
        const pipeline = [];
        if (excludedIds.length > 0) pipeline.push({ $match: { _id: { $nin: excludedIds } } });
        pipeline.push({ $sample: { size: 4 } });
        pipeline.push({ $project: { fname: 1, lname: 1, profilepic: 1, city: 1, state: 1, nation: 1, institute: 1, followers: 1, followings: 1 } });
        const user_data = await User.aggregate(pipeline);
        res.status(200).send({ success: true, data: user_data });
    } catch (error) { res.status(400).send({ success: false, msg: error.message }); }
}

module.exports = {
    registerUser, userlogin, updatePassword, forgetPassword, resetpassword,
    userProfileEdit, searchUser, userLogout, uploadUserImage, getUsers,
    followUser, unfollowUser, searchUserById, deleteUser, getUsersOfInstitute,
    getTopUsers, updateProfilePic, deleteProfilePic, getRandomUsers
}