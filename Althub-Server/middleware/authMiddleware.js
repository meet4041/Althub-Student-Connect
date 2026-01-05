import jwt from "jsonwebtoken";
import config from "../config/config.js";
import Institute from "../models/instituteModel.js"; 
import Admin from "../models/adminModel.js";         
import User from "../models/userModel.js";           

// Helper to reuse verification logic
const verifyUser = async (token) => {
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, config.secret_jwt);
        let user = await Institute.findById(decoded._id).select("+tokenVersion");
        if (!user) user = await Admin.findById(decoded._id).select("+tokenVersion");
        if (!user) user = await User.findById(decoded._id).select("+tokenVersion");
        
        if (!user) return null;

        const dbTokenVersion = user.tokenVersion || 0;
        const tokenPayloadVersion = decoded.version || 0;

        if (dbTokenVersion !== tokenPayloadVersion) return null;
        
        return user;
    } catch (err) {
        return null;
    }
};

// 1. Strict Auth (For API Routes - No Query Params Allowed)
export const requireAuth = async (req, res, next) => {
    const token = 
        (req.headers["authorization"] && req.headers["authorization"].split(" ")[1]) || 
        req.cookies.institute_token || 
        req.cookies.admin_token || 
        req.cookies.jwt_token;

    const user = await verifyUser(token);
    if (user) {
        req.user = user;
        next();
    } else {
        return res.status(401).send({ success: false, msg: "Access Denied" });
    }
};

// 2. Image Auth (Allows Query Param ?token=...)
export const requireImageAuth = async (req, res, next) => {
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
        // For images, we just send 401 without JSON body often, but JSON is fine too
        return res.status(401).send({ success: false, msg: "Image Access Denied" });
    }
};