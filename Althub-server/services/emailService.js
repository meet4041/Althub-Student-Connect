import nodemailer from "nodemailer";
import config from "../config/config.js";

export const sendResetPasswordMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            },
        });
        
        // Use environment variable for URL in production instead of hardcoded localhost
        const clientURL = process.env.CLIENT_URL || "http://localhost:3000";
        const resetLink = `${clientURL}/new-password?token=${token}`;
        
        const mailoptions = {
            from: `"Althub Support" <${config.emailUser}>`,
            to: email,
            subject: 'Reset your Althub password',
            html: `
                <div style="margin:0;padding:32px 16px;background:#f4fbfa;font-family:Arial,sans-serif;color:#0f172a;">
                    <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #dbe7e5;border-radius:20px;overflow:hidden;box-shadow:0 20px 50px rgba(15,23,42,0.08);">
                        <div style="padding:32px 36px;background:linear-gradient(135deg,#ecfeff 0%,#dff8f4 100%);border-bottom:1px solid #e2ecea;text-align:center;">
                            <div style="font-size:34px;font-weight:800;letter-spacing:-0.02em;color:#0f172a;">
                                alt<span style="color:#63d5d0;">hub.</span>
                            </div>
                            <p style="margin:14px 0 0;font-size:14px;letter-spacing:0.18em;text-transform:uppercase;color:#4f9d94;font-weight:700;">
                                Password Reset
                            </p>
                        </div>

                        <div style="padding:36px;">
                            <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#0f172a;">Reset your password</h1>
                            <p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:#475569;">
                                Hi ${name || "there"},
                            </p>
                            <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#475569;">
                                We received a request to reset your Althub account password. Click the button below to create a new password.
                            </p>

                            <div style="margin:30px 0;text-align:center;">
                                <a href="${resetLink}" style="display:inline-block;padding:14px 28px;border-radius:14px;background:#4f9d94;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;">
                                    Reset Password
                                </a>
                            </div>

                            <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#64748b;">
                                If the button does not work, copy and paste this link into your browser:
                            </p>
                            <p style="margin:0 0 24px;padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;word-break:break-all;font-size:13px;line-height:1.7;color:#0f172a;">
                                ${resetLink}
                            </p>

                            <p style="margin:0 0 10px;font-size:14px;line-height:1.7;color:#64748b;">
                                If you did not request this, you can safely ignore this email.
                            </p>
                            <p style="margin:0;font-size:14px;line-height:1.7;color:#64748b;">
                                This link is meant only for your account security.
                            </p>
                        </div>
                    </div>
                </div>
            `
        };
        const info = await transporter.sendMail(mailoptions);
        return info;
    } catch (error) {
        console.error("Nodemailer Error:", error);
        throw new Error("Failed to send email. Please try again later.");
    }
};
