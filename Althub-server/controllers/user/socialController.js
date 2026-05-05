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

export const followUser = async (req, res) => {
    const actingUserId = req.user._id.toString(); // IDOR PREVENTED
    if (actingUserId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(actingUserId);
            if (!user.followers.includes(actingUserId)) {
                await user.updateOne({ $push: { followers: actingUserId } });
                await currentUser.updateOne({ $push: { followings: req.params.id } });
                res.status(200).json("followed");
            } else { res.status(403).json("already follow"); }
        } catch (err) { res.status(500).json(err); }
    } else { res.status(403).json("cant follow self"); }
};

export const unfollowUser = async (req, res) => {
    const actingUserId = req.user._id.toString(); // IDOR PREVENTED
    if (actingUserId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(actingUserId);
            if (user.followers.includes(actingUserId)) {
                await user.updateOne({ $pull: { followers: actingUserId } });
                await currentUser.updateOne({ $pull: { followings: req.params.id } });
                res.status(200).json("unfollowed");
            } else { res.status(403).json("dont follow user"); }
        } catch (err) { res.status(500).json(err); }
    } else { res.status(403).json("cant unfollow self"); }
};
