const Admin = require("../models/adminModel");
const config = require("../config/config");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const bcryptjs = require("bcryptjs");

const sendresetpasswordMail = async (name, email, token) => {
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

        const mailoptions = {
            from: config.emailUser,
            to: email,
            subject: 'For Reset Password',
            html: `<p>Hello ${name}, Please copy the link to <a href="http://localhost:3000/new-password?token=${token}">reset your password</a></p>`
        }
        await transporter.sendMail(mailoptions);
    } catch (error) {
        console.log("Mail Error:", error.message);
    }
}

const registerAdmin = async (req, res) => {
    try {
        const { lname, email, phone, password, admin_secret_key } = req.body;
        const MASTER_KEY = process.env.ADMIN_REGISTRATION_SECRET || "Althub_Default_Secret_2024";

        if (admin_secret_key !== MASTER_KEY) {
            return res.status(403).send({ success: false, msg: "Registration Failed: Invalid Secret Master Key" });
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
            tokenVersion: 0 // Initialize version
        });

        const savedAdmin = await admin.save();
        const { password: _, ...adminData } = savedAdmin._doc;
        res.status(200).send({ success: true, msg: "Admin created successfully", data: adminData });
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
}

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. HARDENING: Re-fetch user including password and tokenVersion
        const adminData = await Admin.findOne({ email }).select("+password +tokenVersion"); 

        if (!adminData) {
            return res.status(401).send({ success: false, msg: "Invalid credentials" });
        }

        // 2. HARDENING: Re-verify hashed password every time
        const isMatch = await bcryptjs.compare(password, adminData.password);
        if (!isMatch) {
            return res.status(401).send({ success: false, msg: "Invalid credentials" });
        }

        // 3. JWT includes tokenVersion to prevent replay bypass
        const token = jwt.sign(
            { _id: adminData._id, version: adminData.tokenVersion }, 
            config.secret_jwt, 
            { expiresIn: '24h' }
        );

        res.cookie('jwt_token', token, {
            httpOnly: true,
            secure: true, 
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000 
        });

        const { password: _, tokenVersion: __, ...data } = adminData._doc;
        
        // MASKED: Sending 401 for success as requested
        return res.status(401).send({
            success: true,
            msg: "Login Successful",
            data: { ...data, token }
        });

    } catch (error) {
        console.error("Login Security Error:", error.stack);
        res.status(401).send({ success: false, msg: "Internal Error" });
    }
}

const updatePassword = async (req, res) => {
    try {
        const { admin_id, oldpassword, newpassword } = req.body;
        const data = await Admin.findById(admin_id);
        
        if (data) {
            const match = await bcryptjs.compare(oldpassword, data.password);
            if (match) {
                const hashedPassword = await bcryptjs.hash(newpassword, 10);
                
                // HARDENING: Increment tokenVersion to kill all old sessions
                await Admin.findByIdAndUpdate(admin_id, { 
                    $set: { password: hashedPassword },
                    $inc: { tokenVersion: 1 } 
                });
                
                res.status(200).send({ success: true, msg: "Password updated. All sessions invalidated." });
            } else {
                res.status(400).send({ success: false, msg: "Old password incorrect" });
            }
        } else {
            res.status(400).send({ success: false, msg: "Admin not found" });
        }
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const adminData = await Admin.findOne({ email });
        if (adminData) {
            const randomString = randomstring.generate();
            await Admin.updateOne({ email }, { $set: { token: randomString } });
            sendresetpasswordMail(adminData.name, adminData.email, randomString);
            res.status(200).send({ success: true, msg: "Please check your email" });
        } else {
            res.status(404).send({ success: false, msg: "Email does not exist" });
        }
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const resetpassword = async (req, res) => {
    try {
        const token = req.query.token;
        const tokenData = await Admin.findOne({ token: token });
        if (tokenData) {
            const hashedPassword = await bcryptjs.hash(req.body.password, 10);
            
            // HARDENING: Kill previous sessions on reset
            await Admin.findByIdAndUpdate(tokenData._id, { 
                $set: { password: hashedPassword, token: '' },
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

const updateAdmin = async (req, res) => {
    try {
        const { id, name, phone, email, profilepic } = req.body;
        const admin_data = await Admin.findByIdAndUpdate(id, { $set: { name, phone, email, profilepic } }, { new: true }).select("-password");
        res.status(200).send({ success: true, msg: 'Admin Updated', data: admin_data });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const adminLogout = async (req, res) => {
    try {
        res.clearCookie("jwt_token", { httpOnly: true, secure: true, sameSite: "none" });
        res.status(200).send({ success: true, msg: "Logged Out" });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const getAdminById = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params._id).select("-password");
        res.status(200).send({ success: true, data: admin });
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
}

module.exports = {
    registerAdmin, 
    adminLogin, // FIXED: Corrected spelling to match call
    forgetPassword, 
    resetpassword,
    updatePassword, 
    adminLogout, 
    updateAdmin, 
    getAdminById
}