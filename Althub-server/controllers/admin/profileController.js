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

export const updateAdmin = async (req, res) => {
    try {
        const { id } = req.body;
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).send({ success: false, msg: "No data provided" });
        }
        const updateData = {};
        const fieldsToUpdate = ['name', 'phone', 'email', 'profilepic'];
        fieldsToUpdate.forEach(field => {
            if (req.body[field]) updateData[field] = req.body[field];
        });
        const admin_data = await Admin.findByIdAndUpdate(
            id, { $set: updateData }, { new: true }
        ).select("-password");

        if (!admin_data) return res.status(404).send({ success: false, msg: "Admin not found" });
        res.status(200).send({ success: true, msg: 'Admin Updated', data: admin_data });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

export const getAdminById = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params._id).select("-password");
        res.status(200).send({ success: true, data: admin });
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
}
