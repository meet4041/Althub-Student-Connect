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
        
        // 1. HARDENING: Re-fetch user including password field (which is select: false by default)
        const data = await Admin.findById(admin_id).select("+password"); //
        
        if (data) {
            const match = await bcryptjs.compare(oldpassword, data.password); //
            if (match) {
                const hashedPassword = await bcryptjs.hash(newpassword, 10); //
                
                /**
                 * 2. GLOBAL LOGOUT: 
                 * - Increment tokenVersion to invalidate all existing JWTs on ALL devices.
                 * - Clear any existing reset tokens for security.
                 */
                await Admin.findByIdAndUpdate(admin_id, { 
                    $set: { password: hashedPassword, token: '' },
                    $inc: { tokenVersion: 1 } // Critical: This causes requireAuth middleware to fail for old tokens
                });
                
                // 3. LOCAL LOGOUT: Clear the cookie from the browser that initiated the change
                res.clearCookie("jwt_token", { 
                    httpOnly: true, 
                    secure: true, 
                    sameSite: "none" 
                }); //

                return res.status(200).send({ 
                    success: true, 
                    msg: "Password updated successfully. All active sessions have been terminated. Please log in again." 
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
        const { id } = req.body;

        // 1. Check if req.body exists or is empty
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).send({ success: false, msg: "No data provided for update" });
        }

        const updateData = {};
        const emptyFields = [];

        // 2. Define the list of fields we expect to potentially update
        const fieldsToUpdate = ['name', 'phone', 'email'];

        // 3. Iterate and validate each field
        fieldsToUpdate.forEach(field => {
            // Check if the field exists in req.body
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                const value = req.body[field];

                // 4. VALIDATION: If value is an empty string, null, or undefined, mark it as empty
                if (value === "" || value === null || value === undefined) {
                    emptyFields.push(field);
                } else {
                    updateData[field] = value;
                }
            }
        });

        // 5. EXCEPTION: If any field was passed as empty, return a validation error
        if (emptyFields.length > 0) {
            return res.status(400).send({
                success: false,
                msg: `Fields cannot be empty: ${emptyFields.join(", ")}`
            });
        }

        // 6. Ensure there is actually something to update after validation
        if (Object.keys(updateData).length === 0) {
            return res.status(400).send({ success: false, msg: "No valid fields provided to update" });
        }

        // 7. Perform the update only with validated data
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
    adminLogin, // FIXED: Corrected spelling to match call
    forgetPassword,
    resetpassword,
    updatePassword,
    adminLogout,
    updateAdmin,
    getAdminById
}