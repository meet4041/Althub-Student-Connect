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

export const updatePassword = async (req, res) => {
    try {
        const { admin_id, oldpassword, newpassword } = req.body;
        const data = await Admin.findById(admin_id).select("+password");

        if (data) {
            const match = await bcryptjs.compare(oldpassword, data.password);
            if (match) {
                if (!validatePassword(newpassword)) {
                    return res.status(400).send({ success: false, msg: "New password is too weak." });
                }

                const hashedPassword = await bcryptjs.hash(newpassword, 10);

                await Admin.findByIdAndUpdate(admin_id, {
                    $set: { password: hashedPassword, token: '' },
                    $inc: { tokenVersion: 1 }
                });

                legacyAuthCookieNames.forEach((name) => res.clearCookie(name, getAuthCookieOptions()));
                res.clearCookie(authCookieNames.superAdmin, getAuthCookieOptions());
                res.clearCookie("csrf_token", getReadableCsrfCookieOptions());
                return res.status(200).send({ success: true, msg: "Password updated successfully." });
            } else {
                return res.status(400).send({ success: false, msg: "Old password incorrect" });
            }
        } else {
            return res.status(404).send({ success: false, msg: "Admin not found" });
        }
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

export const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const adminData = await Admin.findOne({ email });
        if (adminData) {
            const resetToken = randomstring.generate();
            const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
            const tokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
            await Admin.updateOne({ email }, { $set: { token: hashedToken, tokenExpires } });
            const baseUrl = req.headers.origin || req.headers.referer?.split("/").slice(0, 3).join("/");
            sendresetpasswordMail(adminData.name, adminData.email, resetToken, baseUrl);
            res.status(200).send({ success: true, msg: "Please check your email" });
        } else {
            res.status(404).send({ success: false, msg: "Email does not exist" });
        }
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

export const resetpassword = async (req, res) => {
    try {
        const token = req.query.token;
        if (!token) return res.status(400).send({ success: false, msg: "Token missing" });
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const tokenData = await Admin.findOne({ token: hashedToken, tokenExpires: { $gt: new Date() } });
        if (tokenData) {
            if (!validatePassword(req.body.password)) {
                return res.status(400).send({ success: false, msg: "Password is too weak." });
            }
            const hashedPassword = await bcryptjs.hash(req.body.password, 10);
            await Admin.findByIdAndUpdate(tokenData._id, {
                $set: { password: hashedPassword, token: '', tokenExpires: null },
                $inc: { tokenVersion: 1 }
            });
            res.status(200).send({ success: true, msg: "Password reset successfully" });
        } else {
            res.status(400).send({ success: false, msg: "Token expired" });
        }
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}
