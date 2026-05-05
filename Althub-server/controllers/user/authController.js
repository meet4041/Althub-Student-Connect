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

        res.cookie(authCookieNames.main, token, getAuthCookieOptions({ maxAge: 7 * 24 * 60 * 60 * 1000 }));

        res.status(200).send({ success: true, data: user_data });
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
                const mainToken = createtoken(userData);
                const refreshToken = createRefreshToken(userData, jti);

                // Persist refresh token record
                try {
                    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                    await RefreshToken.create({ userid: userData._id.toString(), jti, expiresAt });
                } catch (err) {
                    console.error('RefreshToken create failed', err.message);
                }

                res.cookie(authCookieNames.main, mainToken, getAuthCookieOptions({ maxAge: 7 * 24 * 60 * 60 * 1000 }));
                res.cookie(authCookieNames.mainRefresh, refreshToken, {
                    ...getAuthCookieOptions({ maxAge: 7 * 24 * 60 * 60 * 1000 }),
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
        const token = req.cookies[authCookieNames.mainRefresh] || req.cookies.refresh_token || req.body.refresh_token;
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

        res.cookie(authCookieNames.main, accessToken, getAuthCookieOptions({ maxAge: 15 * 60 * 1000 }));

        return res.status(200).send({ success: true, accessToken });
    } catch (error) {
        return res.status(400).send({ success: false, msg: error.message });
    }
}

export const userLogout = async (req, res) => {
    try {
        clearMainAuthCookies(res);
        res.status(200).send({ success: true, msg: "Logged Out" });
    }
    catch (error) { res.status(400).send({ success: false }); }
}

export const getMyAuth = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, msg: "Unauthorized" });
        const userObj = req.user.toObject ? req.user.toObject() : req.user;
        delete userObj.password;
        delete userObj.token;
        return res.status(200).json({ success: true, data: userObj });
    } catch (err) { res.status(500).json({ success: false, msg: err.message }); }
};
