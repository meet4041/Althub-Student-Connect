import Admin from "../../models/adminModel.js";
import User from "../../models/userModel.js";
import Education from "../../models/educationModel.js";
import Institute from "../../models/instituteModel.js";
import PlacementCell from "../../models/placementModel.js";
import AlumniOffice from "../../models/alumniModel.js";
import config from "../../config/config.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import randomstring from "randomstring";
import bcryptjs from "bcryptjs";
import mongoose from "mongoose";
import { authCookieNames, getAuthCookieOptions, getReadableCsrfCookieOptions, legacyAuthCookieNames } from "../../config/authCookies.js";

// --- UTILITIES ---

const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
}

const sendresetpasswordMail = async (name, email, token, baseUrl) => {
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

        // Prefer the calling app's origin (e.g., super-admin) if provided
        const clientURL = baseUrl || process.env.CLIENT_URL || "http://localhost:3000";

        const mailoptions = {
            from: config.emailUser,
            to: email,
            subject: 'For Reset Password',
            html: `<p>Hello ${name}, Please copy the link to <a href="${clientURL}/new-password?token=${token}">reset your password</a></p>`
        }
        await transporter.sendMail(mailoptions);
    } catch (error) {
        console.error("Mail Error:", error.message);
    }
}

const determineUserStatus = (educations) => {
    if (!educations || educations.length === 0) return "-";

    const now = new Date();
    let isStudent = false;

    for (let edu of educations) {
        let gradYear = 0;

        // 1. Try to use End Date
        if (edu.enddate) {
            const d = new Date(edu.enddate);
            if (!isNaN(d.getTime())) gradYear = d.getFullYear();
        }
        // 2. Try to use Join Date + Duration
        else if (edu.joindate && edu.course) {
            const s = new Date(edu.joindate);
            if (!isNaN(s.getTime())) {
                const startYear = s.getFullYear();
                const courseName = (edu.course || "").toLowerCase();
                let duration = 0;

                if (courseName.includes('b.tech') || courseName.includes('btech') || courseName.includes('bachelor')) {
                    duration = 4;
                } else if (courseName.includes('m.tech') || courseName.includes('mtech') || courseName.includes('master')) {
                    duration = 2;
                } else {
                    duration = 4;
                }
                gradYear = startYear + duration;
            }
        }

        // If we found a valid graduation year
        if (gradYear > 0) {
            const cutoffDate = new Date(gradYear, 4, 15); // May 15th
            if (now <= cutoffDate) {
                isStudent = true;
                break;
            }
        }
    }

    return isStudent ? "Student" : "Alumni";
};

export const getAllAlumniOffices = async (req, res) => {
    try {
        // Fetch institutes that have the role 'Alumni'
        const data = await Institute.find({ role: 'Alumni' }).populate('parent_id', 'name');
        res.status(200).send({ success: true, data: data });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
};

export const getAllPlacementCells = async (req, res) => {
    try {
        // Fetch institutes that have the role 'Placement'
        const data = await Institute.find({ role: 'Placement' }).populate('parent_id', 'name');
        res.status(200).send({ success: true, data: data });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
};

export const getUsersByInstitute = async (req, res) => {
    try {
        const { instituteId } = req.params;

        // 1. Fetch users belonging to this specific ID
        const data = await User.aggregate([
            {
                $match: { institute_id: new mongoose.Types.ObjectId(instituteId) }
            },
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

        // 2. Format the data for the frontend (Calculates Student vs Alumni status)
        const finalData = data.map(user => {
            const type = determineUserStatus(user.educationList); // Re-uses your existing utility
            let eduStart = "-";
            let eduEnd = "-";

            if (user.educationList && user.educationList.length > 0) {
                const sortedEdu = user.educationList.sort((a, b) => new Date(b.enddate) - new Date(a.enddate));
                const latest = sortedEdu[0];
                if (latest.joindate) eduStart = new Date(latest.joindate).toISOString().split('T')[0];
                if (latest.enddate) eduEnd = new Date(latest.enddate).toISOString().split('T')[0];
            }

            return { ...user, type, eduStart, eduEnd };
        });

        res.status(200).send({ success: true, data: finalData });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

export const getUsersByInstituteName = async (req, res) => {
    try {
        const { instituteName } = req.params; // This will be "DAU", etc.

        const data = await User.aggregate([
            {
                // Matches the string value in the 'institute' field
                $match: { institute: instituteName } 
            },
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
            const type = determineUserStatus(user.educationList);
            let eduStart = "-";
            let eduEnd = "-";
            
            if (user.educationList && user.educationList.length > 0) {
                const sortedEdu = user.educationList.sort((a, b) => new Date(b.enddate) - new Date(a.enddate));
                const latest = sortedEdu[0];
                if(latest.joindate) eduStart = new Date(latest.joindate).toISOString().split('T')[0];
                if(latest.enddate) eduEnd = new Date(latest.enddate).toISOString().split('T')[0];
            }
            
            return { ...user, type, eduStart, eduEnd };
        });

        res.status(200).send({ success: true, data: finalData });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

export const getUsers = async (req, res) => {
    try {
        const data = await User.aggregate([
            {
                $lookup: {
                    from: Education.collection.name, // "educations"
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
            const type = determineUserStatus(user.educationList);
            let eduStart = "-";
            let eduEnd = "-";

            if (user.educationList && user.educationList.length > 0) {
                const sortedEdu = user.educationList.sort((a, b) => {
                    const dateA = new Date(a.enddate || "1900-01-01");
                    const dateB = new Date(b.enddate || "1900-01-01");
                    return dateB - dateA;
                });

                const latest = sortedEdu[0];
                if (latest.joindate) eduStart = new Date(latest.joindate).toISOString().split('T')[0];
                if (latest.enddate) eduEnd = new Date(latest.enddate).toISOString().split('T')[0];
            }

            delete user.educationList;

            return { ...user, type, eduStart, eduEnd };
        });

        res.status(200).send({ success: true, data: finalData });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

export const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        await User.deleteOne({ _id: id });
        res.status(200).send({ success: true, msg: "User Deleted Successfully" });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

export const getPlacementCells = async (req, res) => {
    try {
        const data = await PlacementCell.find({
            $or: [
                { role: 'placement_cell' },
                { role: { $exists: false } },
                { role: null }
            ]
        })
            .populate('parent_institute_id', 'name');
        const mapped = data.map(item => {
            const obj = item.toObject();
            return {
                ...obj,
                institute: obj.institute || obj.parent_institute_id?.name || "N/A"
            };
        });
        res.status(200).send({ success: true, count: mapped.length, data: mapped });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

export const getAlumniOffices = async (req, res) => {
    try {
        const data = await AlumniOffice.find({
            $or: [
                { role: 'alumni_office' },
                { role: { $exists: false } },
                { role: null }
            ]
        })
            .populate('parent_institute_id', 'name');
        const mapped = data.map(item => {
            const obj = item.toObject();
            return {
                ...obj,
                institute: obj.institute || obj.parent_institute_id?.name || "N/A"
            };
        });
        res.status(200).send({ success: true, count: mapped.length, data: mapped });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}
