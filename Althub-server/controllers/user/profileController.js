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
            clearMainAuthCookies(res);
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
        const actingUserId = req.user._id.toString(); // IDOR PREVENTED
        if (req.params.id !== actingUserId && req.user.role !== 'admin') {
            return res.status(403).send({ success: false, msg: "Unauthorized deletion attempt" });
        }
        const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: { profilepic: "" } }, { new: true });
        res.status(200).send({ success: true, msg: "Profile removed", data: updatedUser });
    } catch (error) { res.status(500).send({ success: false, msg: error.message }); }
};
