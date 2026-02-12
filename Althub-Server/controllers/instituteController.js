import Institute from "../models/instituteModel.js";
import AlumniOffice from "../models/alumniModel.js";
import PlacementCell from "../models/placementModel.js";
import User from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import config from "../config/config.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import randomstring from "randomstring";
import { uploadFromBuffer, connectToMongo } from "../db/conn.js";

// --- UTILITIES ---
const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
}

const securePassword = async (password) => {
    try { return await bcryptjs.hash(password, 10); } 
    catch (error) { console.error("Hashing Error:", error.message); }
}

const sendresetpasswordMail = async (name, email, token) => {
    try {
        const baseUrl = (config.clientUrl || "http://localhost:3000").replace(/\/$/, "");
        const resetUrl = `${baseUrl}/new-password?token=${token}`;
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
            html: `<p>Hello ${name}, Please copy the link to <a href="${resetUrl}">reset your password</a></p>`
        }
        await transporter.sendMail(mailoptions);
    } catch (error) { console.error("Mail Error:", error.message); }
}

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
    } catch (error) { console.error("Invitation Mail Error:", error.message); }
}

// --- CONTROLLERS ---

// [UPDATED] REGISTER: ROUTES TO THE CORRECT TABLE
const registerInstitute = async (req, res) => {
    try {
        const { name, email, phone, password, role, masterKey, parent_institute_id } = req.body;
        const selectedRole = role || 'institute';
        
        // 1. Check Master Key
        const roleKeyMap = {
            'institute': process.env.INSTITUTE_MASTER_KEY,
            'alumni_office': process.env.ALUMNI_OFFICE_MASTER_KEY || process.env.ALUMNI_OFFICE_MASTER_KEY,
            'placement_cell': process.env.PLACEMENT_CELL_MASTER_KEY
        };

        if (!masterKey || masterKey.trim() !== roleKeyMap[selectedRole]) {
            return res.status(403).json({ success: false, msg: "Invalid Master Key." });
        }

        if (!validatePassword(password)) {
            return res.status(400).send({ success: false, msg: "Password too weak." });
        }

        // 2. Check Duplicates in ALL tables
        const existsInst = await Institute.findOne({ email });
        const existsAlum = await AlumniOffice.findOne({ email });
        const existsPlace = await PlacementCell.findOne({ email });

        if (existsInst || existsAlum || existsPlace) {
            return res.status(400).send({ success: false, msg: "Email already registered." });
        }

        const spassword = await securePassword(password);
        let savedData;

        // 3. Save to Specific Table
        if (selectedRole === 'institute') {
            const newInstitute = new Institute({ name, email, phone, password: spassword, role: 'institute' });
            savedData = await newInstitute.save();
        } 
        else if (selectedRole === 'alumni_office') {
            if (!parent_institute_id) return res.status(400).send({ success: false, msg: "Parent Institute Required" });
            const newAlumni = new AlumniOffice({ name, email, phone, password: spassword, role: 'alumni_office', parent_institute_id });
            savedData = await newAlumni.save();
        } 
        else if (selectedRole === 'placement_cell') {
            if (!parent_institute_id) return res.status(400).send({ success: false, msg: "Parent Institute Required" });
            const newPlacement = new PlacementCell({ name, email, phone, password: spassword, role: 'placement_cell', parent_institute_id });
            savedData = await newPlacement.save();
        }

        res.status(200).send({ success: true, msg: "Registration Successful", data: savedData });

    } catch (error) { res.status(500).send({ success: false, msg: error.message }); }
}

// [BIFURCATED LOGIN]
const instituteLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).send({ success: false, msg: "Required fields missing" });

        // Search logic: Check Main -> Check Alumni -> Check Placement
        let user = await Institute.findOne({ email }).select("+password +role");
        
        if (!user) user = await AlumniOffice.findOne({ email }).select("+password +role +parent_institute_id");
        if (!user) user = await PlacementCell.findOne({ email }).select("+password +role +parent_institute_id");

        if (user) {
            const isMatch = await bcryptjs.compare(password, user.password);
            if (isMatch) {
                const tokenPayload = { 
                    _id: user._id, 
                    role: user.role, 
                    version: user.tokenVersion 
                };
                if (user.parent_institute_id) tokenPayload.parent_institute_id = user.parent_institute_id;

                const token = jwt.sign(tokenPayload, config.secret_jwt, { expiresIn: '24h' });
                res.cookie('institute_token', token, { httpOnly: true, secure: true, sameSite: 'none' });
                res.status(200).send({ success: true, msg: "Login Successful", data: user, token });
            } else { res.status(401).send({ success: false, msg: "Invalid credentials" }); }
        } else { res.status(404).send({ success: false, msg: "Account not found" }); }
    } catch (error) { res.status(500).send({ success: false, msg: "Internal Server Error" }); }
}

// [SIMPLE GET] Fetches from existing 'institutetb1' collection
const getInstitutes = async (req, res) => {
    try {
        // 1. Find ALL documents in the collection
        // 2. We REMOVED .select() to ensure the 'name' field is not filtered out
        const data = await Institute.find({}).lean();
            
        // Debugging: Print to your VS Code terminal to prove names are found
        console.log("------------------------------------------");
        console.log(`[DEBUG] Institutes Found: ${data.length}`);
        if (data.length > 0) {
            console.log(`[DEBUG] First Institute Name: '${data[0].name}'`); // Should print "DAU"
        }
        console.log("------------------------------------------");
        
        res.status(200).send({ success: true, data });
    } catch (error) { 
        console.error("getInstitues Error:", error);
        res.status(500).send({ success: false, msg: error.message }); 
    }
}

// [UPDATED] UPDATE PASSWORD: CHECKS ALL 3 TABLES
const instituteUpdatePassword = async (req, res) => {
    try {
        const { institute_id, oldpassword, newpassword } = req.body;
        
        // Find user in any of the 3 tables
        let data = await Institute.findById(institute_id).select("+password");
        let Model = Institute;

        if (!data) {
            data = await AlumniOffice.findById(institute_id).select("+password");
            Model = AlumniOffice;
        }
        if (!data) {
            data = await PlacementCell.findById(institute_id).select("+password");
            Model = PlacementCell;
        }

        if (data) {
            const match = await bcryptjs.compare(oldpassword, data.password);
            if (match) {
                if (!validatePassword(newpassword)) return res.status(400).send({ success: false, msg: "New password is too weak." });
                const hashedPassword = await securePassword(newpassword);
                
                // Update using the identified Model
                await Model.findByIdAndUpdate(institute_id, { $set: { password: hashedPassword, token: '' }, $inc: { tokenVersion: 1 } });
                
                res.clearCookie("institute_token", { httpOnly: true, secure: true, sameSite: "none" });
                return res.status(200).send({ success: true, msg: "Password updated." });
            }
            return res.status(400).send({ success: false, msg: "Old password incorrect" });
        }
        res.status(404).send({ success: false, msg: "Account not found" });
    } catch (error) { res.status(400).send({ success: false, msg: error.message }); }
}

const instituteForgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        // Search all tables
        let instData = await Institute.findOne({ email });
        let Model = Institute;

        if (!instData) { instData = await AlumniOffice.findOne({ email }); Model = AlumniOffice; }
        if (!instData) { instData = await PlacementCell.findOne({ email }); Model = PlacementCell; }

        if (instData) {
            const randomString = randomstring.generate();
            await Model.updateOne({ email }, { $set: { token: randomString } });
            sendresetpasswordMail(instData.name, instData.email, randomString);
            res.status(200).send({ success: true, msg: "Please check your email" });
        } else { res.status(404).send({ success: false, msg: "Email does not exist" }); }
    } catch (error) { res.status(400).send({ success: false, msg: error.message }); }
}

const instituteResetPassword = async (req, res) => {
    try {
        const token = req.query.token;
        // Check all tables for the token
        let tokenData = await Institute.findOne({ token: token });
        let Model = Institute;

        if (!tokenData) { tokenData = await AlumniOffice.findOne({ token: token }); Model = AlumniOffice; }
        if (!tokenData) { tokenData = await PlacementCell.findOne({ token: token }); Model = PlacementCell; }

        if (tokenData) {
            if (!validatePassword(req.body.password)) return res.status(400).send({ success: false, msg: "Password is too weak." });
            const hashedPassword = await securePassword(req.body.password);
            await Model.findByIdAndUpdate(tokenData._id, { $set: { password: hashedPassword, token: '' }, $inc: { tokenVersion: 1 } });
            res.status(200).send({ success: true, msg: "Password reset successfully" });
        } else { res.status(400).send({ success: false, msg: "Token expired" }); }
    } catch (error) { res.status(400).send({ success: false, msg: error.message }); }
}

// [UPDATED] GET BY ID: CHECKS ALL 3 TABLES
const getInstituteById = async (req, res) => {
    try {
        const id = req.params._id || req.params.id;
        
        let data = await Institute.findById(id).select("-password");
        if (!data) data = await AlumniOffice.findById(id).select("-password");
        if (!data) data = await PlacementCell.findById(id).select("-password");

        if (!data) return res.status(404).send({ success: false, msg: "Account not found" });
        res.status(200).send({ success: true, data });
    } catch (error) { res.status(500).send({ success: false, msg: error.message }); }
}

// [UPDATED] UPDATE ACCOUNT: CHECKS ALL 3 TABLES
const updateInstitute = async (req, res) => {
    try {
        const { id, name, address, phone, email, website, image, active } = req.body;
        const updateFields = { name, address, phone, email, website, image, active };

        let updated = await Institute.findByIdAndUpdate(id, { $set: updateFields }, { new: true }).select("-password");
        if (!updated) updated = await AlumniOffice.findByIdAndUpdate(id, { $set: updateFields }, { new: true }).select("-password");
        if (!updated) updated = await PlacementCell.findByIdAndUpdate(id, { $set: updateFields }, { new: true }).select("-password");

        if(updated) {
            res.status(200).send({ success: true, msg: 'Profile Updated', data: updated });
        } else {
            res.status(404).send({ success: false, msg: "Account not found" });
        }
    } catch (error) { res.status(500).send({ success: false, msg: error.message }); }
}

// [UPDATED] DELETE: CHECKS ALL 3 TABLES
const deleteInstitute = async (req, res) => {
    try {
        const id = req.params.id;
        let deleted = await Institute.findByIdAndDelete(id);
        if(!deleted) deleted = await AlumniOffice.findByIdAndDelete(id);
        if(!deleted) deleted = await PlacementCell.findByIdAndDelete(id);

        if(deleted) {
            res.status(200).send({ success: true, msg: "Account deleted successfully" });
        } else {
            res.status(404).send({ success: false, msg: "Account not found" });
        }
    } catch (error) { res.status(500).send({ success: false, msg: error.message }); }
}

const inviteUser = async (req, res) => {
    try {
        const { fname, phone, email } = req.body;
        const userData = await User.findOne({ email });
        if (userData) return res.status(400).send({ success: false, msg: "User already exists" });
        
        const randpassword = randomstring.generate(8);
        const spassword = await securePassword(randpassword);
        
        const user = new User({ fname, phone, email, password: spassword });
        await user.save();
        sendInvitationMail(fname, email, randpassword);
        res.status(200).send({ success: true, msg: "Invitation email sent" });
    } catch (error) { res.status(500).send({ success: false, msg: error.message }); }
}

// Get Alumni Office(s) linked to institute
const getAlumniOfficeByInstitute = async (req, res) => {
    try {
        const instituteId = req.params.instituteId;
        const data = await AlumniOffice.find({ parent_institute_id: instituteId })
            .select("-password -token")
            .lean();
        res.status(200).send({ success: true, data });
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
};

// Get Placement Cell(s) linked to institute
const getPlacementCellByInstitute = async (req, res) => {
    try {
        const instituteId = req.params.instituteId;
        const data = await PlacementCell.find({ parent_institute_id: instituteId })
            .select("-password -token")
            .lean();
        res.status(200).send({ success: true, data });
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
};

const uploadInstituteImage = async (req, res) => {
    try {
        if (req.file !== undefined) {
            await connectToMongo();
            const filename = `institute-${Date.now()}-${req.file.originalname}`;
            const fileId = await uploadFromBuffer(req.file.buffer, filename, req.file.mimetype);
            const picture = { url: `/api/images/${fileId}` };
            res.status(200).send({ success: true, data: picture });
        } else { 
            res.status(400).send({ success: false, msg: "Please select a file" }); 
        }
    } catch (error) { 
        res.status(500).send({ success: false, msg: error.message }); 
    }
}

export default {
    registerInstitute,
    instituteLogin,
    updateInstitute,
    instituteUpdatePassword,
    instituteForgetPassword,
    instituteResetPassword,
    getInstituteById,
    deleteInstitute,
    getInstitutes,
    inviteUser,
    uploadInstituteImage,
    getAlumniOfficeByInstitute,
    getPlacementCellByInstitute
};
