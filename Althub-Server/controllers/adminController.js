import Admin from "../models/adminModel.js";
import User from "../models/userModel.js";
import Education from "../models/educationModel.js";
import Institute from "../models/instituteModel.js";
import config from "../config/config.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import randomstring from "randomstring";
import bcryptjs from "bcryptjs";

// --- UTILITIES ---

const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
}

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

        // Use process.env.CLIENT_URL or fallback to localhost
        const clientURL = process.env.CLIENT_URL || "http://localhost:3000";

        const mailoptions = {
            from: config.emailUser,
            to: email,
            subject: 'For Reset Password',
            html: `<p>Hello ${name}, Please copy the link to <a href="${clientURL}/new-password?token=${token}">reset your password</a></p>`
        }
        await transporter.sendMail(mailoptions);
    } catch (error) {
        console.log("Mail Error:", error.message);
    }
}

export const getAllAlumniOffices = async (req, res) => {
    try {
        // Fetch institutes that have the role 'Alumni'
        const data = await Institute.find({ role: 'Alumni' }).populate('parent_id', 'name');
        res.status(200).send({ success: true, data: data });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
};

export const getAllPlacementCells = async (req, res) => {
    try {
        // Fetch institutes that have the role 'Placement'
        const data = await Institute.find({ role: 'Placement' }).populate('parent_id', 'name');
        res.status(200).send({ success: true, data: data });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
};

// Add this to adminController.js
export const getUsersByInstitute = async (req, res) => {
    try {
        const { instituteId } = req.params;

        // 1. Fetch users belonging to this specific ID
        const data = await User.aggregate([
            {
                $match: { institute_id: new mongoose.Types.ObjectId(instituteId) }
            },
            {
                $lookup: {
                    from: Education.collection.name,
                    let: { userId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$userid", { $toString: "$$userId" }] } } },
                        { $project: { course: 1, joindate: 1, enddate: 1 } }
                    ],
                    as: "educationList"
                }
            }
        ]);

        // 2. Format the data for the frontend (Calculates Student vs Alumni status)
        const finalData = data.map(user => {
            const type = determineUserStatus(user.educationList); // Re-uses your existing utility
            let eduStart = "-";
            let eduEnd = "-";

            if (user.educationList && user.educationList.length > 0) {
                const sortedEdu = user.educationList.sort((a, b) => new Date(b.enddate) - new Date(a.enddate));
                const latest = sortedEdu[0];
                if (latest.joindate) eduStart = new Date(latest.joindate).toISOString().split('T')[0];
                if (latest.enddate) eduEnd = new Date(latest.enddate).toISOString().split('T')[0];
            }

            return { ...user, type, eduStart, eduEnd };
        });

        res.status(200).send({ success: true, data: finalData });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

// Add to adminController.js
export const getUsersByInstituteName = async (req, res) => {
    try {
        const { instituteName } = req.params; // This will be "DAU", etc.

        const data = await User.aggregate([
            {
                // Matches the string value in the 'institute' field
                $match: { institute: instituteName } 
            },
            {
                $lookup: {
                    from: Education.collection.name,
                    let: { userId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$userid", { $toString: "$$userId" }] } } },
                        { $project: { course: 1, joindate: 1, enddate: 1 } }
                    ],
                    as: "educationList"
                }
            }
        ]);

        const finalData = data.map(user => {
            const type = determineUserStatus(user.educationList);
            let eduStart = "-";
            let eduEnd = "-";
            
            if (user.educationList && user.educationList.length > 0) {
                const sortedEdu = user.educationList.sort((a, b) => new Date(b.enddate) - new Date(a.enddate));
                const latest = sortedEdu[0];
                if(latest.joindate) eduStart = new Date(latest.joindate).toISOString().split('T')[0];
                if(latest.enddate) eduEnd = new Date(latest.enddate).toISOString().split('T')[0];
            }
            
            return { ...user, type, eduStart, eduEnd };
        });

        res.status(200).send({ success: true, data: finalData });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

// --- STATUS CALCULATION LOGIC ---
const determineUserStatus = (educations) => {
    if (!educations || educations.length === 0) return "-";

    const now = new Date();
    let isStudent = false;

    for (let edu of educations) {
        let gradYear = 0;

        // 1. Try to use End Date
        if (edu.enddate) {
            const d = new Date(edu.enddate);
            if (!isNaN(d.getTime())) gradYear = d.getFullYear();
        }
        // 2. Try to use Join Date + Duration
        else if (edu.joindate && edu.course) {
            const s = new Date(edu.joindate);
            if (!isNaN(s.getTime())) {
                const startYear = s.getFullYear();
                const courseName = (edu.course || "").toLowerCase();
                let duration = 0;

                if (courseName.includes('b.tech') || courseName.includes('btech') || courseName.includes('bachelor')) {
                    duration = 4;
                } else if (courseName.includes('m.tech') || courseName.includes('mtech') || courseName.includes('master')) {
                    duration = 2;
                } else {
                    duration = 4;
                }
                gradYear = startYear + duration;
            }
        }

        // If we found a valid graduation year
        if (gradYear > 0) {
            const cutoffDate = new Date(gradYear, 4, 15); // May 15th
            if (now <= cutoffDate) {
                isStudent = true;
                break;
            }
        }
    }

    return isStudent ? "Student" : "Alumni";
};

// --- CONTROLLERS ---

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

        const isProduction = process.env.NODE_ENV === 'production';

        res.cookie('jwt_token', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'None' : 'Lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        const { password: _, tokenVersion: __, ...data } = adminData._doc;

        return res.status(200).send({
            success: true,
            msg: "Login Successful",
            data: { ...data },
            token: token
        });

    } catch (error) {
        res.status(500).send({ success: false, msg: "Internal Error" });
    }
}

export const getUsers = async (req, res) => {
    try {
        const data = await User.aggregate([
            {
                $lookup: {
                    from: Education.collection.name, // "educations"
                    let: { userId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$userid", { $toString: "$$userId" }] } } },
                        { $project: { course: 1, joindate: 1, enddate: 1 } }
                    ],
                    as: "educationList"
                }
            }
        ]);

        const finalData = data.map(user => {
            const type = determineUserStatus(user.educationList);
            let eduStart = "-";
            let eduEnd = "-";

            if (user.educationList && user.educationList.length > 0) {
                const sortedEdu = user.educationList.sort((a, b) => {
                    const dateA = new Date(a.enddate || "1900-01-01");
                    const dateB = new Date(b.enddate || "1900-01-01");
                    return dateB - dateA;
                });

                const latest = sortedEdu[0];
                if (latest.joindate) eduStart = new Date(latest.joindate).toISOString().split('T')[0];
                if (latest.enddate) eduEnd = new Date(latest.enddate).toISOString().split('T')[0];
            }

            delete user.educationList;

            return { ...user, type, eduStart, eduEnd };
        });

        res.status(200).send({ success: true, data: finalData });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

export const updatePassword = async (req, res) => {
    try {
        const { admin_id, oldpassword, newpassword } = req.body;
        const data = await Admin.findById(admin_id).select("+password");

        if (data) {
            const match = await bcryptjs.compare(oldpassword, data.password);
            if (match) {
                if (!validatePassword(newpassword)) {
                    return res.status(400).send({ success: false, msg: "New password is too weak." });
                }

                const hashedPassword = await bcryptjs.hash(newpassword, 10);

                await Admin.findByIdAndUpdate(admin_id, {
                    $set: { password: hashedPassword, token: '' },
                    $inc: { tokenVersion: 1 }
                });

                res.clearCookie("jwt_token");
                return res.status(200).send({ success: true, msg: "Password updated successfully." });
            } else {
                return res.status(400).send({ success: false, msg: "Old password incorrect" });
            }
        } else {
            return res.status(404).send({ success: false, msg: "Admin not found" });
        }
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

export const forgetPassword = async (req, res) => {
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

export const resetpassword = async (req, res) => {
    try {
        const token = req.query.token;
        const tokenData = await Admin.findOne({ token: token });
        if (tokenData) {
            if (!validatePassword(req.body.password)) {
                return res.status(400).send({ success: false, msg: "Password is too weak." });
            }
            const hashedPassword = await bcryptjs.hash(req.body.password, 10);
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

export const updateAdmin = async (req, res) => {
    try {
        const { id } = req.body;
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).send({ success: false, msg: "No data provided" });
        }
        const updateData = {};
        const fieldsToUpdate = ['name', 'phone', 'email'];
        fieldsToUpdate.forEach(field => {
            if (req.body[field]) updateData[field] = req.body[field];
        });
        const admin_data = await Admin.findByIdAndUpdate(
            id, { $set: updateData }, { new: true }
        ).select("-password");

        if (!admin_data) return res.status(404).send({ success: false, msg: "Admin not found" });
        res.status(200).send({ success: true, msg: 'Admin Updated', data: admin_data });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

export const adminLogout = async (req, res) => {
    try {
        res.clearCookie("jwt_token");
        res.status(200).send({ success: true, msg: "Logged Out" });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

export const getAdminById = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params._id).select("-password");
        res.status(200).send({ success: true, data: admin });
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
}

export const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        await User.deleteOne({ _id: id });
        res.status(200).send({ success: true, msg: "User Deleted Successfully" });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

// Fetch ALL Placement Cells
export const getPlacementCells = async (req, res) => {
    try {
        const data = await PlacementCell.find({}); // Unrestricted fetch
        res.status(200).send({ success: true, count: data.length, data: data });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

// Fetch ALL Alumni Offices
export const getAlumniOffices = async (req, res) => {
    try {
        const data = await AlumniOffice.find({}); // Unrestricted fetch
        res.status(200).send({ success: true, count: data.length, data: data });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}