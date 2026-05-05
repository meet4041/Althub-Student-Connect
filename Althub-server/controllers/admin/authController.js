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

export const registerAdmin = async (req, res) => {
    try {
        const { lname, email, phone, password, admin_secret_key } = req.body;
        const MASTER_KEY = process.env.ADMIN_REGISTRATION_SECRET || "Althub_Default_Secret_2024";

        if (admin_secret_key !== MASTER_KEY) {
            return res.status(403).send({ success: false, msg: "Registration Failed: Invalid Secret Master Key" });
        }

        if (!validatePassword(password)) {
            return res.status(400).send({
                success: false,
                msg: "Password must contain at least 8 characters, 1 uppercase, 1 lowercase, and 1 number."
            });
        }

        const adminExists = await Admin.findOne({ email });
        if (adminExists) {
            return res.status(400).send({ success: false, msg: "Admin already exists" });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const admin = new Admin({
            name: lname,
            phone: phone,
            email: email,
            password: hashedPassword,
            tokenVersion: 0
        });

        const savedAdmin = await admin.save();
        const { password: _, ...adminData } = savedAdmin._doc;
        res.status(200).send({ success: true, msg: "Admin created successfully", data: adminData });
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
}

export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const adminData = await Admin.findOne({ email }).select("+password +tokenVersion");

        if (!adminData) {
            return res.status(401).send({ success: false, msg: "Invalid credentials" });
        }

        const isMatch = await bcryptjs.compare(password, adminData.password);
        if (!isMatch) {
            return res.status(401).send({ success: false, msg: "Invalid credentials" });
        }

        const token = jwt.sign(
            { _id: adminData._id, version: adminData.tokenVersion, role: "admin" },
            config.secret_jwt,
            { expiresIn: '24h' }
        );

        legacyAuthCookieNames.forEach((name) => res.clearCookie(name, getAuthCookieOptions()));

        res.cookie(authCookieNames.superAdmin, token, getAuthCookieOptions({ maxAge: 24 * 60 * 60 * 1000 }));

        const csrfToken = crypto.randomBytes(32).toString('hex');
        res.cookie('csrf_token', csrfToken, getReadableCsrfCookieOptions({ maxAge: 24 * 60 * 60 * 1000 }));

        const { password: _, tokenVersion: __, ...data } = adminData._doc;

        return res.status(200).send({
            success: true,
            msg: "Login Successful",
            data: { ...data, role: "admin" },
            token
        });

    } catch (error) {
        res.status(500).send({ success: false, msg: "Internal Error" });
    }
}

export const adminLogout = async (req, res) => {
    try {
        legacyAuthCookieNames.forEach((name) => res.clearCookie(name, getAuthCookieOptions()));
        res.clearCookie(authCookieNames.superAdmin, getAuthCookieOptions());
        res.clearCookie("csrf_token", getReadableCsrfCookieOptions());
        res.status(200).send({ success: true, msg: "Logged Out" });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}
