import Institute from "../../models/instituteModel.js";
import AlumniOffice from "../../models/alumniModel.js";
import PlacementCell from "../../models/placementModel.js";
import User from "../../models/userModel.js";
import bcryptjs from "bcryptjs";
import config from "../../config/config.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import randomstring from "randomstring";
import { uploadFromBuffer, connectToMongo } from "../../db/conn.js";
import { authCookieNames, getAuthCookieOptions, getReadableCsrfCookieOptions, legacyAuthCookieNames } from "../../config/authCookies.js";

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
    const lines = content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (lines.length === 0) return [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailSet = new Set();

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const cells = line
            .split(/[,\t;]+/)
            .map((cell) => cell.trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1').trim());

        if (!cells.length) continue;
        if (i === 0 && cells.some((cell) => /^email$/i.test(cell))) continue;

        cells.forEach((cell) => {
            const normalized = cell.toLowerCase();
            if (emailRegex.test(normalized)) {
                emailSet.add(normalized);
            }
        });
    }

    return Array.from(emailSet);
};

export const inviteUser = async (req, res) => {
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

export const bulkInviteAlumniCsv = async (req, res) => {
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
        if (
            (req.user.role === 'alumni_office' || req.user.role === 'placement_cell') &&
            req.user.parent_institute_id
        ) {
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
