import jwt from "jsonwebtoken";
import config from "../config/config.js";
import Institute from "../models/instituteModel.js";
import AlumniOffice from "../models/alumniModel.js";
import PlacementCell from "../models/placementModel.js";
import Admin from "../models/adminModel.js";
import User from "../models/userModel.js";

// --- HELPER FUNCTION: Verify Token & Find User in ANY Table ---
const verifyUser = async (token) => {
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, config.secret_jwt);
        
        // 1. Check Institute Table (Main)
        let user = await Institute.findById(decoded._id).select("+tokenVersion");
        
        // 2. Check Alumni Office
        if (!user) user = await AlumniOffice.findById(decoded._id).select("+tokenVersion");
        
        // 3. Check Placement Cell
        if (!user) user = await PlacementCell.findById(decoded._id).select("+tokenVersion");
        
        // 4. Check Admin (for legacy or admin routes)
        if (!user) user = await Admin.findById(decoded._id).select("+tokenVersion");
        
        // 5. Check Student/User (for legacy)
        if (!user) user = await User.findById(decoded._id).select("+tokenVersion");
        
        if (!user) return null;

        // Token Version Check (Security Feature: invalidates old tokens on password change)
        const dbTokenVersion = user.tokenVersion || 0;
        const tokenPayloadVersion = decoded.version || 0;

        if (dbTokenVersion !== tokenPayloadVersion) return null;
        
        return user;
    } catch (err) {
        return null;
    }
};

// --- 1. STRICT AUTH (For API Routes) ---
// Does NOT allow token in URL query params (Secure)
export const requireAuth = async (req, res, next) => {
    try {
        const token = 
            (req.headers["authorization"] && req.headers["authorization"].split(" ")[1]) || 
            req.cookies.institute_token || 
            req.cookies.admin_token || 
            req.cookies.jwt_token;

        if (!token) {
            return res.status(401).json({ success: false, msg: "Access Denied. No token provided." });
        }

        const user = await verifyUser(token);
        
        if (user) {
            req.user = user;
            next();
        } else {
            return res.status(401).json({ success: false, msg: "Invalid Token or User Not Found." });
        }
    } catch (error) {
        return res.status(401).json({ success: false, msg: "Authentication Error" });
    }
};

// --- 2. IMAGE AUTH (For <img> tags) ---
// ALLOWS token in URL query params (?token=...)
export const requireImageAuth = async (req, res, next) => {
    try {
        const token = 
            req.query.token || // <--- ALLOWED HERE ONLY
            req.cookies.institute_token || 
            req.cookies.admin_token || 
            req.cookies.jwt_token ||
            (req.headers["authorization"] && req.headers["authorization"].split(" ")[1]);

        const user = await verifyUser(token);
        
        if (user) {
            req.user = user;
            next();
        } else {
            return res.status(401).send({ success: false, msg: "Image Access Denied" });
        }
    } catch (error) {
        return res.status(401).send({ success: false, msg: "Image Auth Error" });
    }
};