import Institute from "../models/instituteModel.js";
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

const getClientUrl = () => {
    const clientUrl = config.clientUrl || process.env.CLIENT_URL;
    if (!clientUrl) {
        throw new Error("CLIENT_URL is not configured");
    }
    return clientUrl.replace(/\/$/, "");
};

const sendresetpasswordMail = async (name, email, token) => {
    try {
<<<<<<< HEAD
=======
        const baseUrl = getClientUrl();
        const resetUrl = `${baseUrl}/new-password?token=${token}`;
>>>>>>> c94aaa1 (althub main v2)
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
    } catch (error) { console.error("Mail Error:", error.message); }
}

const sendInvitationMail = async (name, email, tempPass) => {
    try {
        const loginUrl = `${getClientUrl()}/login`;
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
            html: `<p>Hello ${name}, You are invited to connect with Althub. Your temporary password is: <b>${tempPass}</b></p><p>Please <a href="${loginUrl}">Login here</a>.</p>`
        }
        await transporter.sendMail(mailoptions);
    } catch (error) { console.error("Invitation Mail Error:", error.message); }
}

<<<<<<< HEAD
=======
const sendCsvInviteMail = async ({ instituteName, email, tempPass, role }) => {
    try {
        const baseUrl = getClientUrl();
        const loginUrl = `${baseUrl}/login`;
        const isAlumni = role === 'alumni';
        const roleLabel = isAlumni ? 'Alumni' : 'Student';
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: { user: config.emailUser, pass: config.emailPassword }
        });
        const mailoptions = {
            from: config.emailUser,
            to: email,
            subject: `Your ${instituteName} ${roleLabel} Account is Ready`,
            html: `
                <p>Hello,</p>
                <p>Your ${roleLabel.toLowerCase()} account for <b>${instituteName}</b> has been created.</p>
                <p><b>Email:</b> ${email}<br/>
                <b>Temporary Password:</b> ${tempPass}</p>
                <p>Please login here: <a href="${loginUrl}">${loginUrl}</a></p>
                <p>After logging in, please change your password.</p>
            `
        };
        await transporter.sendMail(mailoptions);
    } catch (error) { console.error("CSV Invite Mail Error:", error.message); }
};

const parseCsvEmails = (buffer) => {
    const content = buffer.toString('utf-8');
    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];
    const emails = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const firstCol = line.split(',')[0]?.trim();
        if (!firstCol) continue;
        if (i === 0 && /email/i.test(firstCol)) continue;
        emails.push(firstCol);
    }
    return Array.from(new Set(emails));
};

>>>>>>> c94aaa1 (althub main v2)
// --- CONTROLLERS ---

const registerInstitute = async (req, res) => {
    try {
        const { name, email, phone, password, masterKey } = req.body;
        if (masterKey !== config.masterKey) return res.status(403).send({ success: false, msg: "Invalid Master Key." });
        if (!validatePassword(password)) return res.status(400).send({ success: false, msg: "Password must contain at least 8 characters, 1 uppercase, 1 lowercase, and 1 number." });

        const instituteExists = await Institute.findOne({ email });
        if (instituteExists) return res.status(400).send({ success: false, msg: "Institute already exists" });

        const spassword = await securePassword(password);
        const institute = new Institute({ name, email, phone, password: spassword, active: false, tokenVersion: 0 });
        const savedData = await institute.save();
        const { password: _, ...data } = savedData._doc; 
        res.status(200).send({ success: true, msg: "Registration successful", data });
    } catch (error) { res.status(500).send({ success: false, msg: error.message }); }
}

const instituteLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).send({ success: false, msg: "Required fields missing" });

        const instituteData = await Institute.findOne({ email }).select("+password +tokenVersion");
        if (instituteData) {
            const isMatch = await bcryptjs.compare(password, instituteData.password);
            if (isMatch) {
<<<<<<< HEAD
                const token = jwt.sign({ _id: instituteData._id, version: instituteData.tokenVersion }, config.secret_jwt, { expiresIn: '24h' });
                res.cookie('institute_token', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 24 * 60 * 60 * 1000 });
                const { password: _, tokenVersion: __, ...data } = instituteData._doc;
                res.status(200).send({ success: true, msg: "Login Successful", data, token });
            } else { res.status(401).send({ success: false, msg: "Invalid credentials" }); }
        } else { res.status(404).send({ success: false, msg: "Institute not found" }); }
    } catch (error) { res.status(500).send({ success: false, msg: "Internal Server Error" }); }
}

const instituteUpdatePassword = async (req, res) => {
    try {
        const { institute_id, oldpassword, newpassword } = req.body;
        const data = await Institute.findById(institute_id).select("+password");
=======
                const tokenPayload = { 
                    _id: user._id, 
                    role: user.role, 
                    version: user.tokenVersion 
                };
                if (user.parent_institute_id) tokenPayload.parent_institute_id = user.parent_institute_id;

                const token = jwt.sign(tokenPayload, config.secret_jwt, { expiresIn: '24h' });
                const isProduction = process.env.NODE_ENV === 'production';
                res.cookie('institute_token', token, { httpOnly: true, secure: isProduction, sameSite: isProduction ? 'None' : 'Lax', maxAge: 24 * 60 * 60 * 1000 });
                const csrfToken = crypto.randomBytes(32).toString('hex');
                res.cookie('csrf_token', csrfToken, { httpOnly: false, secure: isProduction, sameSite: isProduction ? 'None' : 'Lax', maxAge: 24 * 60 * 60 * 1000 });
                const { password: _, tokenVersion: __, ...safeData } = user.toObject();
                res.status(200).send({ success: true, msg: "Login Successful", data: safeData, token });
            } else { res.status(401).send({ success: false, msg: "Invalid credentials" }); }
        } else { res.status(401).send({ success: false, msg: "Invalid credentials" }); }
    } catch (error) { res.status(500).send({ success: false, msg: "Internal Server Error" }); }
}

// [SIMPLE GET] Fetches from existing 'institutetb1' collection
const getInstitutes = async (req, res) => {
    try {
        // SECURITY: Public endpoint — only expose fields needed for registration dropdown
        const data = await Institute.find({}).select("_id name image").lean();
        
        res.status(200).send({ success: true, data });
    } catch (error) { 
        console.error("getInstitutes Error:", error);
        res.status(500).send({ success: false, msg: error.message }); 
    }
}

// [UPDATED] UPDATE PASSWORD: CHECKS ALL 3 TABLES
const instituteUpdatePassword = async (req, res) => {
    try {
        const { oldpassword, newpassword } = req.body;
        const institute_id = req.user?._id?.toString();
        
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

>>>>>>> c94aaa1 (althub main v2)
        if (data) {
            const match = await bcryptjs.compare(oldpassword, data.password);
            if (match) {
                if (!validatePassword(newpassword)) return res.status(400).send({ success: false, msg: "New password is too weak." });
                const hashedPassword = await securePassword(newpassword);
                await Institute.findByIdAndUpdate(institute_id, { $set: { password: hashedPassword, token: '' }, $inc: { tokenVersion: 1 } });
                res.clearCookie("institute_token", { httpOnly: true, secure: true, sameSite: "none" });
                return res.status(200).send({ success: true, msg: "Password updated." });
            }
            return res.status(400).send({ success: false, msg: "Old password incorrect" });
        }
        res.status(404).send({ success: false, msg: "Institute not found" });
    } catch (error) { res.status(400).send({ success: false, msg: error.message }); }
}

const instituteForgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const instData = await Institute.findOne({ email });
        if (instData) {
<<<<<<< HEAD
            const randomString = randomstring.generate();
            await Institute.updateOne({ email }, { $set: { token: randomString } });
            sendresetpasswordMail(instData.name, instData.email, randomString);
            res.status(200).send({ success: true, msg: "Please check your email" });
        } else { res.status(404).send({ success: false, msg: "Email does not exist" }); }
=======
            const resetToken = randomstring.generate();
            const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
            const tokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
            await Model.updateOne({ email }, { $set: { token: hashedToken, tokenExpires } });
            sendresetpasswordMail(instData.name, instData.email, resetToken);
        }
        res.status(200).send({ success: true, msg: "If an account exists, please check your email." });
>>>>>>> c94aaa1 (althub main v2)
    } catch (error) { res.status(400).send({ success: false, msg: error.message }); }
}

const instituteResetPassword = async (req, res) => {
    try {
        const token = req.query.token;
        const tokenData = await Institute.findOne({ token: token });
        if (tokenData) {
            if (!validatePassword(req.body.password)) return res.status(400).send({ success: false, msg: "Password is too weak." });
            const hashedPassword = await securePassword(req.body.password);
            await Institute.findByIdAndUpdate(tokenData._id, { $set: { password: hashedPassword, token: '' }, $inc: { tokenVersion: 1 } });
            res.status(200).send({ success: true, msg: "Password reset successfully" });
        } else { res.status(400).send({ success: false, msg: "Token expired" }); }
    } catch (error) { res.status(400).send({ success: false, msg: error.message }); }
}

const getInstituteById = async (req, res) => {
    try {
<<<<<<< HEAD
        const data = await Institute.findById(req.params._id || req.params.id).select("-password");
        if (!data) return res.status(404).send({ success: false, msg: "Institute not found" });
=======
        const id = req.user?._id?.toString();
        
        let data = await Institute.findById(id).select("-password");
        if (!data) data = await AlumniOffice.findById(id).select("-password");
        if (!data) data = await PlacementCell.findById(id).select("-password");

        if (!data) return res.status(404).send({ success: false, msg: "Account not found" });
>>>>>>> c94aaa1 (althub main v2)
        res.status(200).send({ success: true, data });
    } catch (error) { res.status(500).send({ success: false, msg: error.message }); }
}

const updateInstitute = async (req, res) => {
    try {
<<<<<<< HEAD
        const { id, name, address, phone, email, website, image, active } = req.body;
        const updated = await Institute.findByIdAndUpdate(
            id,
            { $set: { name, address, phone, email, website, image, active } },
            { new: true }
        ).select("-password");
        res.status(200).send({ success: true, msg: 'Institute Updated', data: updated });
=======
        const id = req.user?._id?.toString();
        const { name, address, phone, email, website, image, active } = req.body;
        const updateFields = { name, address, phone, email, website, image, active };

        let updated = await Institute.findByIdAndUpdate(id, { $set: updateFields }, { new: true }).select("-password");
        if (!updated) updated = await AlumniOffice.findByIdAndUpdate(id, { $set: updateFields }, { new: true }).select("-password");
        if (!updated) updated = await PlacementCell.findByIdAndUpdate(id, { $set: updateFields }, { new: true }).select("-password");

        if(updated) {
            res.status(200).send({ success: true, msg: 'Profile Updated', data: updated });
        } else {
            res.status(404).send({ success: false, msg: "Account not found" });
        }
>>>>>>> c94aaa1 (althub main v2)
    } catch (error) { res.status(500).send({ success: false, msg: error.message }); }
}

const deleteInstitute = async (req, res) => {
    try {
<<<<<<< HEAD
        const id = req.params.id;
        await Institute.findByIdAndDelete(id);
        res.status(200).send({ success: true, msg: "Institute deleted successfully" });
    } catch (error) { res.status(500).send({ success: false, msg: error.message }); }
}
=======
        const id = req.user?._id?.toString();
        let deleted = await Institute.findByIdAndDelete(id);
        if(!deleted) deleted = await AlumniOffice.findByIdAndDelete(id);
        if(!deleted) deleted = await PlacementCell.findByIdAndDelete(id);
>>>>>>> c94aaa1 (althub main v2)

const getInstitues = async (req, res) => {
    try {
        const data = await Institute.find({}).select("name image address website active").lean();
        res.status(200).send({ success: true, data });
    } catch (error) { res.status(500).send({ success: false, msg: error.message }); }
}

const inviteUser = async (req, res) => {
    try {
        const { fname, phone, email } = req.body;
        const userData = await User.findOne({ email });
        if (userData) return res.status(400).send({ success: false, msg: "User already exists" });
        
        const randpassword = randomstring.generate(8);
        const spassword = await securePassword(randpassword);
        
        const user = new User({ fname, phone, email, password: spassword, institute_id: req.user._id });
        await user.save();
        sendInvitationMail(fname, email, randpassword);
        res.status(200).send({ success: true, msg: "Invitation email sent" });
    } catch (error) { res.status(500).send({ success: false, msg: error.message }); }
}

// [FIX 2] Add the uploadInstituteImage function
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
    getInstitues,
    inviteUser,
    uploadInstituteImage // Export the new function
};