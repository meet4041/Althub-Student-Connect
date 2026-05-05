import User from "../../models/userModel.js";
import Education from "../../models/educationModel.js";
import bcryptjs from "bcryptjs";
import config from "../../config/config.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import randomstring from "randomstring";
import mongoose from "mongoose";
import crypto from "crypto";
import { uploadFromBuffer, connectToMongo } from "../../db/conn.js";
import RefreshToken from "../../models/refreshTokenModel.js";
import { determineUserStatus, checkAlumniStatus, getLatestEducation, createFlexibleRegex } from "../../services/userService.js";
import { sendResetPasswordMail } from "../../services/emailService.js";
import { authCookieNames, getAuthCookieOptions, getReadableCsrfCookieOptions, legacyAuthCookieNames } from "../../config/authCookies.js";

// --- SECURITY UTILITIES ---
const sanitizeInput = (text) => {
    if (typeof text !== 'string') return text;
    return text.replace(/<[^>]*>?/gm, '');
};

// --- HELPER FUNCTIONS ---

// Access / Refresh token helpers
const createAccessToken = (user) => {
    return jwt.sign({ _id: user._id, version: user.tokenVersion || 0, role: user.role || 'student' }, config.secret_jwt, { expiresIn: '15m' });
}

const createRefreshToken = (user, jti) => {
    return jwt.sign({ _id: user._id, version: user.tokenVersion || 0, role: user.role || 'student', jti }, config.secret_refresh, { expiresIn: '7d' });
}

const createtoken = (user) => {
    return jwt.sign({ _id: user._id, version: user.tokenVersion || 0, role: user.role || 'student' }, config.secret_jwt, { expiresIn: '7d' });
}

const clearMainAuthCookies = (res) => {
    const authOptions = getAuthCookieOptions();
    legacyAuthCookieNames.forEach((name) => res.clearCookie(name, authOptions));
    res.clearCookie(authCookieNames.main, authOptions);
    res.clearCookie(authCookieNames.mainRefresh, { ...authOptions, path: '/api' });
    res.clearCookie("refresh_token", { ...authOptions, path: '/api' });
    res.clearCookie("csrf_token", getReadableCsrfCookieOptions());
};

const securePassword = async (password) => {
    try { return await bcryptjs.hash(password, 10); } catch (error) { throw new Error(error.message); }
}

export const searchUser = async (req, res) => {
    try {
        const { search, location, skill, degree, year } = req.body;
        let educationUserIds = null;
        if (degree || year) {
            const eduQuery = {};
            if (degree) eduQuery.course = { $regex: createFlexibleRegex(degree) };
            if (year) eduQuery.enddate = { $regex: new RegExp(year.toString()) };
            educationUserIds = await Education.find(eduQuery).distinct('userid');
            if (educationUserIds.length === 0) return res.status(200).send({ success: true, msg: 'No User Found', data: [] });
        }
        const pipeline = [];
        const matchStage = {};
        if (educationUserIds !== null) {
            const objectIds = educationUserIds.map(id => new mongoose.Types.ObjectId(id));
            matchStage._id = { $in: objectIds };
        }
        if (search) {
            matchStage.$text = { $search: search };
        }
        if (location) {
            const locRegex = new RegExp(location, "i");
            const locQuery = { $or: [{ city: { $regex: locRegex } }, { state: { $regex: locRegex } }] };
            if (matchStage.$text) { 
                matchStage.$and = [ locQuery ]; 
            } else {
                Object.assign(matchStage, locQuery);
            }
        }
        if (skill) matchStage.skills = { $regex: new RegExp(skill, "i") };
        if (Object.keys(matchStage).length > 0) pipeline.push({ $match: matchStage });
        pipeline.push({ $limit: 50 });
        pipeline.push({
            $lookup: {
                from: Education.collection.name,
                let: { userId: "$_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$userid", { $toString: "$$userId" }] } } },
                    { $project: { course: 1, enddate: 1 } }
                ],
                as: "educationList"
            }
        });
        pipeline.push({
            $project: {
                fname: 1, lname: 1, profilepic: 1, city: 1, state: 1,
                followers: 1, github: 1, portfolioweb: 1, skills: 1,
                educationList: 1, isAlumni: 1
            }
        });
        const user_data = await User.aggregate(pipeline);
        const finalData = user_data.map(user => {
            const isAlumni = checkAlumniStatus(user.educationList);
            const latestEdu = getLatestEducation(user.educationList);
            delete user.educationList;
            return { ...user, isAlumni, latestCourse: latestEdu.course, latestYear: latestEdu.year };
        });
        if (finalData.length > 0) res.status(200).send({ success: true, msg: "User Details", data: finalData });
        else res.status(200).send({ success: true, msg: 'No User Found', data: [] });
    } catch (error) { res.status(400).send({ success: false, msg: error.message }); }
}

export const searchUserById = async (req, res) => {
    try {
        const id = req.params._id;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).send({ success: false });
        const user = await User.find({ _id: id }).lean();
        return res.status(200).send({ success: true, data: user });
    } catch (error) { res.status(500).send({ success: false, msg: error.message }); }
}

export const getUsers = async (req, res) => {
    try {
        const matchStage = {};
        if (req.user?.role !== "admin") {
            if (req.user?.role === "institute") {
                matchStage.institute_id = req.user._id;
            } else if ((req.user?.role === "alumni_office" || req.user?.role === "placement_cell") && req.user?.parent_institute_id) {
                matchStage.institute_id = req.user.parent_institute_id;
            } else if (req.user?.institute_id) {
                matchStage.institute_id = req.user.institute_id;
            }
        }

        const user_data = await User.aggregate([
            ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
            {
                $lookup: {
                    from: Education.collection.name,
                    let: { userId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$userid", { $toString: "$$userId" }] } } },
                        { $project: { course: 1, enddate: 1 } }
                    ],
                    as: "educationList"
                }
            },
            { $project: { fname: 1, lname: 1, role: 1, email: 1, phone: 1, profilepic: 1, educationList: 1 } }
        ]);
        const data = user_data.map(user => {
            const latestEdu = getLatestEducation(user.educationList);
            return { ...user, degree: latestEdu.course };
        });
        res.status(200).send({ success: true, data: data });
    }
    catch (error) { res.status(400).send({ success: false }); }
}

export const getTopUsers = async (req, res) => {
    try { const data = await User.find({ institute: req.body.institute }).limit(5); res.status(200).send({ success: true, data: data }); }
    catch (error) { res.status(400).send({ success: false }); }
}

export const getUsersOfInstitute = async (req, res) => {
    try {
        const instituteParam = req.params.institute;
        const matchStage = {};
        if (instituteParam) {
            if (mongoose.Types.ObjectId.isValid(instituteParam)) {
                matchStage.institute_id = new mongoose.Types.ObjectId(instituteParam);
            } else {
                matchStage.institute = instituteParam;
            }
        }

        const data = await User.aggregate([
            ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
            {
                $lookup: {
                    from: Education.collection.name, 
                    let: { userId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$userid", { $toString: "$$userId" }] } } },
                        { $project: { course: 1, joindate: 1, enddate: 1 } } 
                    ],
                    as: "educationList"
                }
            }
        ]);

        const finalData = data.map(user => {
            // 1. Calculate Status
            const type = determineUserStatus(user.educationList);
            
            // 2. Get Dates from the most recent education record
            let eduStart = "-";
            let eduEnd = "-";
            
            if (user.educationList && user.educationList.length > 0) {
                // Sort by end date descending
                const sortedEdu = user.educationList.sort((a, b) => {
                    const dateA = new Date(a.enddate || "1900-01-01");
                    const dateB = new Date(b.enddate || "1900-01-01");
                    return dateB - dateA;
                });
                
                const latest = sortedEdu[0];
                if(latest.joindate) eduStart = new Date(latest.joindate).toISOString().split('T')[0];
                if(latest.enddate) eduEnd = new Date(latest.enddate).toISOString().split('T')[0];
            }
            
            delete user.educationList;
            
            return { ...user, type, eduStart, eduEnd };
        });

        res.status(200).send({ success: true, data: finalData });
    }
    catch (error) { 
        console.error(error);
        res.status(400).send({ success: false }); 
    }
}

export const getAlumniByCourseSpec = async (req, res) => {
    try {
        const course = sanitizeInput(req.query.course || req.body.course);
        const specialization = sanitizeInput(req.query.specialization || req.body.specialization);
        const instituteParam = sanitizeInput(req.query.instituteId || req.body.instituteId || "");

        if (!course && !specialization) {
            return res.status(400).send({ success: false, msg: "Course or specialization is required" });
        }

        const courseRegex = createFlexibleRegex(course);
        const specRegex = createFlexibleRegex(specialization);

        const matchStage = {};
        if (instituteParam) {
            if (mongoose.Types.ObjectId.isValid(instituteParam)) {
                matchStage.institute_id = new mongoose.Types.ObjectId(instituteParam);
            } else {
                matchStage.institute = instituteParam;
            }
        }

        const data = await User.aggregate([
            ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
            {
                $lookup: {
                    from: Education.collection.name,
                    let: { userId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$userid", { $toString: "$$userId" }] } } },
                        { $project: { course: 1, specialization: 1, joindate: 1, enddate: 1 } }
                    ],
                    as: "educationList"
                }
            }
        ]);

        const filtered = data.filter(user => {
            if (!user.educationList || user.educationList.length === 0) return false;
            const matching = user.educationList.filter(edu => {
                const courseOk = courseRegex ? courseRegex.test(edu.course || "") : true;
                const specOk = specRegex ? specRegex.test(edu.specialization || "") : true;
                return courseOk && specOk;
            });
            if (matching.length === 0) return false;
            return checkAlumniStatus(matching);
        });

        res.status(200).send({ success: true, data: filtered });
    } catch (error) {
        console.error(error);
        res.status(400).send({ success: false, msg: error.message });
    }
}

export const getRandomUsers = async (req, res) => {
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
