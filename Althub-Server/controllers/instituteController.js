import Institute from "../models/instituteModel.js";
import AlumniOffice from "../models/alumniModel.js";
import PlacementCell from "../models/placementModel.js";
import User from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import config from "../config/config.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
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

const normalizeInstituteRole = (role) => {
    if (!role) return role;

    const normalized = String(role).trim().toLowerCase();
    if (normalized === 'alumni') return 'alumni_office';
    if (normalized === 'placement') return 'placement_cell';
    return normalized;
}

const buildInviteEmailTemplate = ({ title, intro, email, tempPass, loginUrl, roleLabel, instituteName }) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f7fb;font-family:Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f7fb;padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden;">
                    <tr>
                        <td style="padding:32px 32px 20px;background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 100%);">
                            <div style="font-size:12px;letter-spacing:1.6px;text-transform:uppercase;color:#bfdbfe;font-weight:700;">Althub</div>
                            <h1 style="margin:12px 0 0;font-size:28px;line-height:1.25;color:#ffffff;font-weight:800;">${title}</h1>
                            <p style="margin:12px 0 0;font-size:15px;line-height:1.7;color:#dbeafe;">${intro}</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:28px 32px 8px;">
                            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:20px 22px;">
                                <div style="font-size:13px;color:#64748b;margin-bottom:8px;">Institution</div>
                                <div style="font-size:18px;font-weight:700;color:#0f172a;margin-bottom:18px;">${instituteName}</div>
                                <div style="font-size:13px;color:#64748b;margin-bottom:8px;">Account email</div>
                                <div style="font-size:16px;font-weight:700;color:#0f172a;margin-bottom:18px;">${email}</div>
                                <div style="font-size:13px;color:#64748b;margin-bottom:8px;">Temporary password</div>
                                <div style="font-size:22px;line-height:1.2;font-weight:800;color:#1d4ed8;letter-spacing:0.8px;">${tempPass}</div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 32px 0;">
                            <p style="margin:0 0 18px;font-size:15px;line-height:1.8;color:#334155;">
                                Use the button below to sign in to your ${roleLabel.toLowerCase()} account and complete your first login.
                            </p>
                            <table role="presentation" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="border-radius:12px;background:#1d4ed8;">
                                        <a href="${loginUrl}" style="display:inline-block;padding:14px 24px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;">Open Althub</a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin:18px 0 0;font-size:13px;line-height:1.7;color:#64748b;">
                                If the button does not open, use this link:
                                <a href="${loginUrl}" style="color:#1d4ed8;text-decoration:none;">${loginUrl}</a>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:24px 32px 32px;">
                            <div style="border-top:1px solid #e2e8f0;padding-top:20px;font-size:14px;line-height:1.8;color:#475569;">
                                <strong style="color:#0f172a;">Recommended next steps</strong><br />
                                1. Sign in using the credentials above.<br />
                                2. Change your password immediately after login.<br />
                                3. Complete your profile before using the platform.
                            </div>
                        </td>
                    </tr>
                </table>
                <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#94a3b8;">This is an automated Althub email. Please do not reply to this message.</p>
            </td>
        </tr>
    </table>
</body>
</html>
`;

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
        const baseUrl = (config.clientUrl || "http://localhost:3000").replace(/\/$/, "");
        const loginUrl = `${baseUrl}/login`;
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: { user: config.emailUser, pass: config.emailPassword }
        });
        const mailoptions = {
            from: `"Althub Team" <${config.emailUser}>`,
            to: email,
            subject: 'You are invited to connect Althub+',
            html: buildInviteEmailTemplate({
                title: 'Your Althub Account Is Ready',
                intro: `Hello ${name || 'there'}, your access to Althub has been created successfully.`,
                email,
                tempPass,
                loginUrl,
                roleLabel: 'Member',
                instituteName: 'Althub'
            })
        }
        return await transporter.sendMail(mailoptions);
    } catch (error) {
        console.error("Invitation Mail Error:", error);
        throw new Error(error?.message || "Failed to send invitation email");
    }
}

const sendCsvInviteMail = async ({ instituteName, email, tempPass, role }) => {
    try {
        const baseUrl = (config.clientUrl || "http://localhost:3000").replace(/\/$/, "");
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
            from: `"Althub Team" <${config.emailUser}>`,
            to: email,
            subject: `Your ${instituteName} ${roleLabel} Account is Ready`,
            html: buildInviteEmailTemplate({
                title: `Your ${instituteName} ${roleLabel} Account Is Ready`,
                intro: `Your ${roleLabel.toLowerCase()} access for ${instituteName} has been provisioned. Your temporary credentials are below.`,
                email,
                tempPass,
                loginUrl,
                roleLabel,
                instituteName
            })
        };
        return await transporter.sendMail(mailoptions);
    } catch (error) {
        console.error("CSV Invite Mail Error:", error);
        throw new Error(error?.message || `Failed to send invite email to ${email}`);
    }
};

const parseCsvEmails = (buffer) => {
    const content = buffer.toString('utf-8').replace(/^\uFEFF/, '');
    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];
    const emails = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const firstCol = line
            .split(',')[0]
            ?.trim()
            .replace(/^"(.*)"$/, '$1')
            .replace(/^'(.*)'$/, '$1')
            .trim()
            .toLowerCase();

        if (!firstCol) continue;
        if (i === 0 && /email/i.test(firstCol)) continue;
        if (!emailRegex.test(firstCol)) continue;
        emails.push(firstCol);
    }
    return Array.from(new Set(emails));
};

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
                const normalizedRole = normalizeInstituteRole(user.role);
                const tokenPayload = { 
                    _id: user._id, 
                    role: normalizedRole, 
                    version: user.tokenVersion 
                };
                if (user.parent_institute_id) tokenPayload.parent_institute_id = user.parent_institute_id;

                const token = jwt.sign(tokenPayload, config.secret_jwt, { expiresIn: '24h' });
                const isProduction = process.env.NODE_ENV === 'production';
                res.cookie('institute_token', token, { httpOnly: true, secure: isProduction, sameSite: isProduction ? 'None' : 'Lax', maxAge: 24 * 60 * 60 * 1000 });
                const csrfToken = crypto.randomBytes(32).toString('hex');
                res.cookie('csrf_token', csrfToken, { httpOnly: false, secure: isProduction, sameSite: isProduction ? 'None' : 'Lax', maxAge: 24 * 60 * 60 * 1000 });
                const userData = user.toObject ? user.toObject() : user;
                userData.role = normalizedRole;
                res.status(200).send({ success: true, msg: "Login Successful", data: userData, token });
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
                
                const isProduction = process.env.NODE_ENV === 'production';
                res.clearCookie("institute_token", { httpOnly: true, secure: isProduction, sameSite: isProduction ? "None" : "Lax" });
                res.clearCookie("csrf_token", { httpOnly: false, secure: isProduction, sameSite: isProduction ? "None" : "Lax" });
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
            const resetToken = randomstring.generate();
            const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
            const tokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
            await Model.updateOne({ email }, { $set: { token: hashedToken, tokenExpires } });
            sendresetpasswordMail(instData.name, instData.email, resetToken);
            res.status(200).send({ success: true, msg: "Please check your email" });
        } else { res.status(404).send({ success: false, msg: "Email does not exist" }); }
    } catch (error) { res.status(400).send({ success: false, msg: error.message }); }
}

const instituteResetPassword = async (req, res) => {
    try {
        const token = req.query.token;
        if (!token) return res.status(400).send({ success: false, msg: "Token missing" });
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        // Check all tables for the token
        let tokenData = await Institute.findOne({ token: hashedToken, tokenExpires: { $gt: new Date() } });
        let Model = Institute;

        if (!tokenData) { tokenData = await AlumniOffice.findOne({ token: hashedToken, tokenExpires: { $gt: new Date() } }); Model = AlumniOffice; }
        if (!tokenData) { tokenData = await PlacementCell.findOne({ token: hashedToken, tokenExpires: { $gt: new Date() } }); Model = PlacementCell; }

        if (tokenData) {
            if (!validatePassword(req.body.password)) return res.status(400).send({ success: false, msg: "Password is too weak." });
            const hashedPassword = await securePassword(req.body.password);
            await Model.findByIdAndUpdate(tokenData._id, { $set: { password: hashedPassword, token: '', tokenExpires: null }, $inc: { tokenVersion: 1 } });
            res.status(200).send({ success: true, msg: "Password reset successfully" });
        } else { res.status(400).send({ success: false, msg: "Token expired" }); }
    } catch (error) { res.status(400).send({ success: false, msg: error.message }); }
}

const instituteLogout = async (req, res) => {
    try {
        const isProduction = process.env.NODE_ENV === 'production';
        res.clearCookie("institute_token", { httpOnly: true, secure: isProduction, sameSite: isProduction ? "None" : "Lax" });
        res.clearCookie("csrf_token", { httpOnly: false, secure: isProduction, sameSite: isProduction ? "None" : "Lax" });
        res.status(200).send({ success: true, msg: "Logged Out" });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
};

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
        const updateFields = { address, phone, email, website, active };

        if (typeof name !== 'undefined') {
            updateFields.name = name;
            updateFields.institutename = name;
        }

        if (typeof image !== 'undefined') {
            updateFields.image = image;
            updateFields.profilepic = image;
        }

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

const bulkInviteAlumniCsv = async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).send({ success: false, msg: "CSV file required" });
        }
        if (!config.emailUser || !config.emailPassword) {
            return res.status(400).send({ success: false, msg: "Email service not configured" });
        }

        const emails = parseCsvEmails(req.file.buffer);
        if (emails.length === 0) {
            return res.status(400).send({ success: false, msg: "No valid emails found in CSV" });
        }

        let instituteId = req.user._id;
        let instituteName = '';
        if (req.user.role === 'alumni_office' && req.user.parent_institute_id) {
            instituteId = req.user.parent_institute_id;
        }
        const institute = await Institute.findById(instituteId);
        if (institute) instituteName = institute.name || institute.insname || 'Institute';

        const invitedRole = req.user.role === 'alumni_office' ? 'alumni' : 'student';

        const created = [];
        const skipped = [];
        const failed = [];

        for (const email of emails) {
            const exists = await User.findOne({ email });
            if (exists) {
                skipped.push(email);
                continue;
            }
            const tempPass = randomstring.generate({ length: 10, charset: 'alphanumeric' });
            const spassword = await securePassword(tempPass);
            let user = null;
            try {
                user = new User({
                    fname: '',
                    lname: '',
                    email,
                    password: spassword,
                    role: invitedRole,
                    institute: instituteName,
                    institute_id: instituteId,
                    tokenVersion: 0
                });
                await user.save();
                await sendCsvInviteMail({ instituteName, email, tempPass, role: invitedRole });
                created.push(email);
            } catch (mailError) {
                if (user?._id) {
                    await User.findByIdAndDelete(user._id);
                }
                failed.push({
                    email,
                    reason: mailError?.message || 'Unknown email delivery error'
                });
                console.error(`Bulk invite failed for ${email}:`, mailError.message);
            }
        }

        return res.status(200).send({
            success: true,
            data: {
                createdCount: created.length,
                skippedCount: skipped.length,
                failedCount: failed.length,
                created,
                skipped,
                failed
            }
        });
    } catch (error) {
        return res.status(500).send({ success: false, msg: error.message });
    }
};

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
    instituteLogout,
    getInstituteById,
    deleteInstitute,
    getInstitutes,
    inviteUser,
    bulkInviteAlumniCsv,
    uploadInstituteImage,
    getAlumniOfficeByInstitute,
    getPlacementCellByInstitute
};
