import User from "../models/userModel.js";
import Education from "../models/educationModel.js";
import bcryptjs from "bcryptjs";
import config from "../config/config.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import randomstring from "randomstring";
import mongoose from "mongoose";
import crypto from "crypto";
import { uploadFromBuffer, connectToMongo } from "../db/conn.js";
import RefreshToken from "../models/refreshTokenModel.js";
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

const securePassword = async (password) => {
    try { return await bcryptjs.hash(password, 10); } catch (error) { throw new Error(error.message); }
}

const sendresetpasswordMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            },
        });
        
        // Use environment variable for URL in production instead of hardcoded localhost
        const clientURL = process.env.CLIENT_URL || "http://localhost:3000";
        const resetLink = `${clientURL}/new-password?token=${token}`;
        
        const mailoptions = {
            from: `"Althub Support" <${config.emailUser}>`,
            to: email,
            subject: 'Reset your Althub password',
            html: `
                <div style="margin:0;padding:32px 16px;background:#f4fbfa;font-family:Arial,sans-serif;color:#0f172a;">
                    <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #dbe7e5;border-radius:20px;overflow:hidden;box-shadow:0 20px 50px rgba(15,23,42,0.08);">
                        <div style="padding:32px 36px;background:linear-gradient(135deg,#ecfeff 0%,#dff8f4 100%);border-bottom:1px solid #e2ecea;text-align:center;">
                            <div style="font-size:34px;font-weight:800;letter-spacing:-0.02em;color:#0f172a;">
                                alt<span style="color:#63d5d0;">hub.</span>
                            </div>
                            <p style="margin:14px 0 0;font-size:14px;letter-spacing:0.18em;text-transform:uppercase;color:#4f9d94;font-weight:700;">
                                Password Reset
                            </p>
                        </div>

                        <div style="padding:36px;">
                            <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#0f172a;">Reset your password</h1>
                            <p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:#475569;">
                                Hi ${name || "there"},
                            </p>
                            <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#475569;">
                                We received a request to reset your Althub account password. Click the button below to create a new password.
                            </p>

                            <div style="margin:30px 0;text-align:center;">
                                <a href="${resetLink}" style="display:inline-block;padding:14px 28px;border-radius:14px;background:#4f9d94;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;">
                                    Reset Password
                                </a>
                            </div>

                            <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#64748b;">
                                If the button does not work, copy and paste this link into your browser:
                            </p>
                            <p style="margin:0 0 24px;padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;word-break:break-all;font-size:13px;line-height:1.7;color:#0f172a;">
                                ${resetLink}
                            </p>

                            <p style="margin:0 0 10px;font-size:14px;line-height:1.7;color:#64748b;">
                                If you did not request this, you can safely ignore this email.
                            </p>
                            <p style="margin:0;font-size:14px;line-height:1.7;color:#64748b;">
                                This link is meant only for your account security.
                            </p>
                        </div>
                    </div>
                </div>
            `
        };
        const info = await transporter.sendMail(mailoptions);
        return info;
    } catch (error) {
        console.error("Nodemailer Error:", error);
        throw new Error("Failed to send email. Please try again later.");
    }
}

// --- STATUS CALCULATION LOGIC ---
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
                    duration = 4; // Default fallback
                }
                gradYear = startYear + duration;
            }
        }

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

const checkAlumniStatus = (educations) => {
    return determineUserStatus(educations) === "Alumni";
};

const getLatestEducation = (educations) => {
    if (!educations || educations.length === 0) return { course: "", year: "" };
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


// --- CONTROLLERS (Exported Directly) ---

export const registerUser = async (req, res) => {
    try {
        const fname = sanitizeInput(req.body.fname);
        const lname = sanitizeInput(req.body.lname);
        const email = sanitizeInput(req.body.email);
        const institute = sanitizeInput(req.body.institute);
        const institute_id = req.body.institute_id;

        const userData = await User.findOne({ email: email });

        if (userData) {
            return res.status(400).send({ success: false, msg: "User already exists" });
        }

        if (!institute_id) {
            return res.status(400).send({ success: false, msg: "Please select an institute" });
        }

        const spassword = await securePassword(req.body.password);
        const user = new User({
            fname,
            lname,
            gender: sanitizeInput(req.body.gender),
            dob: req.body.dob || null,
            city: sanitizeInput(req.body.city),
            state: sanitizeInput(req.body.state),
            nation: sanitizeInput(req.body.country),
            profilepic: req.body.profilepic || "",
            phone: sanitizeInput(req.body.phone),
            email,
            password: spassword,
            languages: req.body.languages || "",
            github: sanitizeInput(req.body.github),
            portfolioweb: sanitizeInput(req.body.portfolioweb),
            skills: req.body.skills || "",
            role: req.body.role || "student",
            institute,
            institute_id,
            tokenVersion: 0
        });

        const user_data = await user.save();
        const token = await createtoken(user_data); 

        const isProduction = process.env.NODE_ENV === 'production';

        res.cookie("jwt_token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            secure: isProduction,
            sameSite: isProduction ? 'None' : 'Lax',
            path: '/'
        });

        res.status(200).send({ success: true, data: user_data, token: token });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

export const userlogin = async (req, res) => {
    try {
        const email = sanitizeInput(req.body.email);
        const password = req.body.password;
        
        const userData = await User.findOne({ email: email }).select("+tokenVersion +password"); 

        if (userData) {
            const passwordMatch = await bcryptjs.compare(password, userData.password);
            if (passwordMatch) {
                // Issue access + refresh tokens (access short-lived, refresh long-lived)
                const jti = crypto.randomUUID();
                const accessToken = createAccessToken(userData);
                const refreshToken = createRefreshToken(userData, jti);

                // Persist refresh token record
                try {
                    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                    await RefreshToken.create({ userid: userData._id.toString(), jti, expiresAt });
                } catch (err) {
                    console.error('RefreshToken create failed', err.message);
                }

                const isProduction = process.env.NODE_ENV === 'production';

                res.cookie("jwt_token", accessToken, {
                    httpOnly: true,
                    maxAge: 15 * 60 * 1000, // 15 minutes
                    secure: isProduction,
                    sameSite: isProduction ? 'None' : 'Lax',
                    path: '/'
                });

                res.cookie("refresh_token", refreshToken, {
                    httpOnly: true,
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                    secure: isProduction,
                    sameSite: isProduction ? 'None' : 'Lax',
                    path: '/api'
                });

                const userResult = {
                    _id: userData._id,
                    fname: userData.fname,
                    lname: userData.lname,
                    email: userData.email,
                    role: userData.role,
                    profilepic: userData.profilepic,
                }

                res.status(200).send({
                    success: true,
                    msg: "Login Successful",
                    data: userResult
                });
            } else {
                res.status(400).send({ success: false, msg: "Invalid Credentials" });
            }
        } else {
            res.status(400).send({ success: false, msg: "User not found. Please Register." });
        }
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

export const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refresh_token || req.body.refresh_token;
        if (!token) {
            return res.status(401).send({ success: false, msg: "Refresh token missing" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, config.secret_refresh);
        } catch (err) {
            return res.status(401).send({ success: false, msg: "Invalid refresh token" });
        }

        const stored = await RefreshToken.findOne({ jti: decoded.jti, userid: decoded._id, revoked: false });
        if (!stored) {
            return res.status(401).send({ success: false, msg: "Refresh token revoked or not found" });
        }
        if (stored.expiresAt && stored.expiresAt.getTime() < Date.now()) {
            return res.status(401).send({ success: false, msg: "Refresh token expired" });
        }

        const user = await User.findById(decoded._id).select("+tokenVersion");
        if (!user) {
            return res.status(401).send({ success: false, msg: "User not found" });
        }
        if ((user.tokenVersion || 0) !== (decoded.version || 0)) {
            return res.status(401).send({ success: false, msg: "Token version mismatch" });
        }

        const accessToken = createAccessToken(user);
        const isProduction = process.env.NODE_ENV === 'production';

        res.cookie("jwt_token", accessToken, {
            httpOnly: true,
            maxAge: 15 * 60 * 1000,
            secure: isProduction,
            sameSite: isProduction ? 'None' : 'Lax',
            path: '/'
        });

        return res.status(200).send({ success: true, accessToken });
    } catch (error) {
        return res.status(400).send({ success: false, msg: error.message });
    }
}

export const updatePassword = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const { oldpassword, newpassword } = req.body;

        const CurrentUserModel = req.user.constructor;
        const data = await CurrentUserModel.findById(loggedInUserId).select('+password');

        if (data) {
            const passwordMatch = await bcryptjs.compare(oldpassword, data.password);
            
            if (passwordMatch) {
                const hashedNewPassword = await securePassword(newpassword);

                await CurrentUserModel.findByIdAndUpdate(
                    { _id: loggedInUserId },
                    {
                        $set: { password: hashedNewPassword },
                        $inc: { tokenVersion: 1 } 
                    }
                );

                res.clearCookie("jwt_token");

                res.status(200).send({ 
                    success: true, 
                    msg: "Password updated successfully. Please login again." 
                });
            } else { 
                res.status(400).send({ success: false, msg: "Current password is incorrect" }); 
            }
        } else { 
            res.status(400).send({ success: false, msg: "User not found!" }); 
        }
    } catch (error) { 
        res.status(500).send({ success: false, msg: error.message }); 
    }
}

export const forgetPassword = async (req, res) => {
    try {
        const email = sanitizeInput(req.body.email);
        const userData = await User.findOne({ email: email });
        if (userData) {
            const randomString = randomstring.generate();
            await User.updateOne({ email: email }, { $set: { token: randomString } });
            await sendresetpasswordMail(userData.fname, userData.email, randomString);
            res.status(200).send({ success: true, msg: "Check inbox to reset password" });
        } else { res.status(200).send({ success: false, msg: "Email does not exist!" }); }
    } catch (error) { res.status(500).send({ success: false, msg: "Failed to send email." }); }
}

export const resetpassword = async (req, res) => {
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

export const userProfileEdit = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        // Only allow a specific whitelist of editable fields
        const allowedFields = [
            'fname','lname','gender','dob','city','state','nation','phone',
            'email','github','portfolioweb','about','languages','skills'
        ];
        const sanitizedBody = {};
        for (let key of allowedFields) {
            if (Object.prototype.hasOwnProperty.call(req.body, key) && req.body[key] !== undefined) {
                let val = req.body[key];
                // Limit lengths to reasonable bounds
                if (typeof val === 'string' && val.length > 2000) {
                    return res.status(400).send({ success: false, msg: 'Field too large' });
                }
                sanitizedBody[key] = sanitizeInput(val);
            }
        }

        const new_data = await User.findByIdAndUpdate(
            { _id: loggedInUserId },
            { $set: sanitizedBody },
            { new: true }
        );
        res.status(200).send({ success: true, msg: 'Profile Updated', data: new_data });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

export const deleteUser = async (req, res) => {
    try {
        const userIdToDelete = req.params.id;
        const loggedInUser = req.user;
        const loggedInUserId = loggedInUser._id.toString();

        const isSelfDelete = userIdToDelete === loggedInUserId;
        const isInstituteOrAdmin = loggedInUser.name || loggedInUser.role === 'admin';

        if (!isSelfDelete && !isInstituteOrAdmin) {
            return res.status(403).send({ success: false, msg: "Security Alert: Unauthorized deletion attempt!" });
        }

        await User.deleteOne({ _id: userIdToDelete });
        
        if (isSelfDelete) {
            res.clearCookie("jwt_token");
        }
        
        res.status(200).send({ success: true, msg: 'Deleted successfully' });
    } catch (error) { 
        res.status(400).send({ success: false, msg: error.message }); 
    }
}

export const uploadUserImage = async (req, res) => {
    try {
        if (req.file !== undefined) {
            await connectToMongo();
            const filename = `user-${Date.now()}-${req.file.originalname}`;
            const fileId = await uploadFromBuffer(req.file.buffer, filename, req.file.mimetype);
            const picture = { url: `/api/images/${fileId}` };
            res.status(200).send({ success: true, data: picture });
        } else { res.status(400).send({ success: false, msg: "plz select a file" }); }
    } catch (error) { res.status(400).send(error.message); }
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

export const userLogout = async (req, res) => {
    try { res.clearCookie("jwt_token"); res.status(200).send({ success: true, msg: "Logged Out" }); }
    catch (error) { res.status(400).send({ success: false }); }
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

export const followUser = async (req, res) => {
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

export const unfollowUser = async (req, res) => {
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

export const updateProfilePic = async (req, res) => {
    try {
        let fileId;
        if (req.file) {
            await connectToMongo();
            const filename = `profile-${Date.now()}-${req.file.originalname}`;
            fileId = await uploadFromBuffer(req.file.buffer, filename, req.file.mimetype);
        } else { fileId = req.body.fileId; }
        if (!fileId) return res.status(400).send({ success: false, msg: "No file provided" });
        const updatedUser = await User.findByIdAndUpdate(
            req.body.userid,
            { $set: { profilepic: `/api/images/${fileId}` } },
            { new: true }
        );
        res.status(200).send({ success: true, msg: "Profile updated", data: updatedUser });
    } catch (error) { res.status(500).send({ success: false, msg: error.message }); }
};

export const deleteProfilePic = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: { profilepic: "" } }, { new: true });
        res.status(200).send({ success: true, msg: "Profile removed", data: updatedUser });
    } catch (error) { res.status(500).send({ success: false, msg: error.message }); }
};

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
