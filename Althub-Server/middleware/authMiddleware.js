const jwt = require("jsonwebtoken");
const config = require("../config/config");
const Admin = require("../models/adminModel");
const Institute = require("../models/instituteModel");

/**
 * Middleware to protect routes.
 * Implements Token Versioning to prevent Replay Attacks after password changes.
 */
const requireAuth = async (req, res, next) => {
    // 1. Retrieve the token from secure HTTP-only cookies
    const token = req.cookies.institute_token || req.cookies.jwt_token;

    if (!token) {
        return res.status(401).send({ success: false, msg: "Authentication Required" });
    }

    try {
        // 2. Verify the JWT signature
        const decoded = jwt.verify(token, config.secret_jwt);

        // 3. VALIDATE SESSION VERSION (Hardening against Replay Attacks)
        // Check Admin model first, then Institute model
        let user = await Admin.findById(decoded._id).select("+tokenVersion");
        
        if (!user) {
            user = await Institute.findById(decoded._id).select("+tokenVersion");
        }

        // 4. CRITICAL CHECK: Does the token version match the database version?
        // If password was changed, user.tokenVersion will be higher than decoded.version
        if (!user || user.tokenVersion !== decoded.version) {
            console.warn(`Security Alert: Invalid session version for user ${decoded._id}`);
            return res.status(401).send({ 
                success: false, 
                msg: "Session expired due to security change. Please login again." 
            });
        }

        // 5. Attach user info and proceed
        req.user = decoded;
        next();

    } catch (err) {
        console.error("Token verification failed:", err.message);
        return res.status(401).send({ 
            success: false, 
            msg: err.name === "TokenExpiredError" ? "Session Expired" : "Invalid Token" 
        });
    }
};

module.exports = { requireAuth };