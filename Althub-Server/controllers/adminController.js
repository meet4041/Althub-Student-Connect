const Admin = require("../models/adminModel");
const config = require("../config/config");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const bcryptjs = require("bcryptjs");

// --- UTILITIES ---

// 1. Password Policy Validator (New Addition)
const validatePassword = (password) => {
    // Policy: Min 8 chars, 1 Uppercase, 1 Lowercase, 1 Number
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
}

// 2. Mailer: Reset Password
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

// --- CONTROLLERS ---

const registerAdmin = async (req, res) => {
    try {
        const { lname, email, phone, password, admin_secret_key } = req.body;
        const MASTER_KEY = process.env.ADMIN_REGISTRATION_SECRET || "Althub_Default_Secret_2024";

        // 1. Master Key Check
        if (admin_secret_key !== MASTER_KEY) {
            return res.status(403).send({ success: false, msg: "Registration Failed: Invalid Secret Master Key" });
        }

        // 2. Password Strength Check (New)
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

        // MASKED: Sending 200 for success as requested
        return res.status(200).send({
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
        
        // 1. Fetch admin including the password field (hidden by default)
        const data = await Admin.findById(admin_id).select("+password");
        
        if (data) {
            const match = await bcryptjs.compare(oldpassword, data.password);
            if (match) {
                // 2. Password Strength Check (New)
                if (!validatePassword(newpassword)) {
                    return res.status(400).send({ 
                        success: false, 
                        msg: "New password is too weak. Requires 1 Upper, 1 Lower, 1 Number, Min 8 chars." 
                    });
                }

                const hashedPassword = await bcryptjs.hash(newpassword, 10);
                
                // 3. GLOBAL LOGOUT: Increment tokenVersion to invalidate all existing sessions
                // Also clear any reset tokens for security
                await Admin.findByIdAndUpdate(admin_id, { 
                    $set: { password: hashedPassword, token: '' },
                    $inc: { tokenVersion: 1 } 
                });
                
                // 4. LOCAL LOGOUT: Clear the JWT cookie from the current browser
                res.clearCookie("jwt_token", { 
                    httpOnly: true, 
                    secure: true, 
                    sameSite: "none" 
                });

                return res.status(200).send({ 
                    success: true, 
                    msg: "Password updated. You have been logged out from all devices for security." 
                });
            } else {
                return res.status(400).send({ success: false, msg: "Old password incorrect" });
            }
        } else {
            return res.status(400).send({ success: false, msg: "Admin not found" });
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
            // 1. Password Strength Check (New)
            if (!validatePassword(req.body.password)) {
                return res.status(400).send({ 
                    success: false, 
                    msg: "Password is too weak. Requires 1 Upper, 1 Lower, 1 Number, Min 8 chars." 
                });
            }

            const hashedPassword = await bcryptjs.hash(req.body.password, 10);

            // 2. HARDENING: Kill previous sessions on reset
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
        const { id } = req.body;

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).send({ success: false, msg: "No data provided for update" });
        }

        const updateData = {};
        const emptyFields = [];
        const fieldsToUpdate = ['name', 'phone', 'email'];

        fieldsToUpdate.forEach(field => {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                const value = req.body[field];
                if (value === "" || value === null || value === undefined) {
                    emptyFields.push(field);
                } else {
                    updateData[field] = value;
                }
            }
        });

        if (emptyFields.length > 0) {
            return res.status(400).send({
                success: false,
                msg: `Fields cannot be empty: ${emptyFields.join(", ")}`
            });
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).send({ success: false, msg: "No valid fields provided to update" });
        }

        const admin_data = await Admin.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        ).select("-password");

        if (!admin_data) {
            return res.status(404).send({ success: false, msg: "Admin not found" });
        }

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
    adminLogin,
    forgetPassword,
    resetpassword,
    updatePassword,
    adminLogout,
    updateAdmin,
    getAdminById
}