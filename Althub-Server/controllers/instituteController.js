const Institute = require("../models/instituteModel");
const User = require("../models/userModel");
const bcryptjs = require("bcryptjs");
const config = require("../config/config");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");

// Utility: Hash password
const securePassword = async (password) => {
    try {
        return await bcryptjs.hash(password, 10);
    } catch (error) {
        console.error("Hashing Error:", error.message);
    }
}

// Utility: Create Token
const create_token = (id) => {
    try {
        return jwt.sign({ _id: id }, config.secret_jwt, { expiresIn: '24h' });
    } catch (error) {
        console.error("Token Error:", error.message);
    }
}

// Mailer: Reset Password
const sendresetpasswordMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: { user: config.emailUser, pass: config.emailPassword }
        });
        const mailoptions = {
            from: config.emailUser,
            to: email,
            subject: 'For Reset Password',
            html: `<p>Hello ${name}, Please copy the link to <a href="http://localhost:3000/new-password?token=${token}">reset your password</a></p>`
        }
        await transporter.sendMail(mailoptions);
    } catch (error) {
        console.error("Mail Error:", error.message);
    }
}

// Mailer: Invitation
const sendInvitationMail = async (name, email, tempPass) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: { user: config.emailUser, pass: config.emailPassword }
        });
        const mailoptions = {
            from: config.emailUser,
            to: email,
            subject: 'You are invited to connect Althub+',
            html: `<p>Hello ${name}, You are invited to connect with Althub. Your temporary password is: <b>${tempPass}</b></p><p>Please <a href="http://localhost:3000/login">Login here</a>.</p>`
        }
        await transporter.sendMail(mailoptions);
    } catch (error) {
        console.error("Invitation Mail Error:", error.message);
    }
}

// --- CONTROLLERS ---

const registerInstitute = async (req, res) => {
    try {
        const { name, email, phone, password, masterKey } = req.body;

        if (masterKey !== config.masterKey) {
            return res.status(403).send({ success: false, msg: "Invalid Master Key." });
        }

        const instituteExists = await Institute.findOne({ email });
        if (instituteExists) {
            return res.status(400).send({ success: false, msg: "Institute already exists" });
        }

        const spassword = await securePassword(password);
        const institute = new Institute({
            name, email, phone, password: spassword, active: false 
        });

        const savedData = await institute.save();
        const { password: _, ...data } = savedData._doc; 
        
        res.status(200).send({ success: true, msg: "Registration successful", data });

    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
}

const instituteLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // DEBUG: Check if data is reaching here
        if (!email || !password) {
            console.log("Login failed: Missing email or password in request body.");
            return res.status(400).send({ success: false, msg: "Email and password are required" });
        }

        const instituteData = await Institute.findOne({ email });
        
        if (instituteData) {
            const isMatch = await bcryptjs.compare(password, instituteData.password);
            if (isMatch) {
                const token = create_token(instituteData._id);

                res.cookie('institute_token', token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none',
                    maxAge: 24 * 60 * 60 * 1000
                });

                const { password: _, token: __, ...data } = instituteData._doc;

                res.status(200).send({
                    success: true,
                    msg: "Login Successful",
                    data,
                    token
                });
            } else {
                console.log(`Login failed for ${email}: Incorrect password.`);
                res.status(401).send({ success: false, msg: "Invalid credentials" });
            }
        } else {
            console.log(`Login failed: No institute found with email ${email}.`);
            res.status(404).send({ success: false, msg: "Institute not found" });
        }
    } catch (error) {
        console.error("Login System Error:", error);
        res.status(500).send({ success: false, msg: error.message });
    }
}

const updateInstitute = async (req, res) => {
    try {
        const { id, name, address, phone, email, website, image, active } = req.body;
        const updated = await Institute.findByIdAndUpdate(
            id,
            { $set: { name, address, phone, email, website, image, active } },
            { new: true }
        ).select("-password");

        res.status(200).send({ success: true, msg: 'Institute Updated', data: updated });
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
}

const getInstitues = async (req, res) => {
    try {
        const data = await Institute.find({}).select("name image address website active").lean();
        res.status(200).send({ success: true, data });
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
}

const inviteUser = async (req, res) => {
    try {
        const { fname, phone, email } = req.body;
        const userData = await User.findOne({ email });
        if (userData) {
            return res.status(400).send({ success: false, msg: "User already exists" });
        }

        const randpassword = randomstring.generate(8);
        const spassword = await securePassword(randpassword);

        const user = new User({ fname, phone, email, password: spassword });
        const savedUser = await user.save();

        sendInvitationMail(savedUser.fname, savedUser.email, randpassword);

        const { password: _, ...data } = savedUser._doc;
        res.status(200).send({ success: true, msg: "Invitation email sent", data });

    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
}

module.exports = {
    registerInstitute,
    instituteLogin,
    updateInstitute,
    getInstitues,
    inviteUser,
    uploadInstituteImage: async (req, res) => {
        // Handled in route usually, but kept for legacy structure
        try {
            if (req.file) {
                res.status(200).send({ success: true, data: { url: '/instituteImages/' + req.file.filename } });
            } else {
                res.status(400).send({ success: false, msg: "Please select a file" });
            }
        } catch (error) { res.status(500).send(error.message); }
    },
    // Placeholder functions to prevent crashes if routes call them
    instituteUpdatePassword: async (req, res) => { res.status(200).send({success:true}) },
    instituteForgetPassword: async (req, res) => { res.status(200).send({success:true}) },
    instituteResetPassword: async (req, res) => { res.status(200).send({success:true}) },
    deleteInstitute: async (req, res) => { res.status(200).send({success:true}) },
    searchInstituteById: async (req, res) => { res.status(200).send({success:true}) }
}