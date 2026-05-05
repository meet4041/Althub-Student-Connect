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

                clearMainAuthCookies(res);

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
            await sendResetPasswordMail(userData.fname, userData.email, randomString);
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
