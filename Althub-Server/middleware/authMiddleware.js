const jwt = require("jsonwebtoken");
const config = require("../config/config");
const Institute = require("../models/instituteModel");
const Admin = require("../models/adminModel");
const User = require("../models/userModel");

const requireAuth = async (req, res, next) => {
    try {
        // Extract token from Header, Cookie, or Body
        const token = req.headers["authorization"]?.split(" ")[1] || 
                      req.cookies.institute_token || 
                      req.cookies.admin_token || 
                      req.body.token;

        if (!token) {
            return res.status(401).send({ success: false, msg: "Access Denied: No Token Provided" });
        }

        const decoded = jwt.verify(token, config.secret_jwt);
        
        // 1. Check all user collections for the ID
        let user = await Institute.findById(decoded._id).select("+tokenVersion");
        if (!user) user = await Admin.findById(decoded._id).select("+tokenVersion");
        if (!user) user = await User.findById(decoded._id).select("+tokenVersion");

        if (!user) {
            return res.status(401).send({ success: false, msg: "User no longer exists" });
        }

        // 2. GLOBAL LOGOUT CHECK (The Hardening)
        // If DB version is 1 but token version is 0, someone changed the password.
        if (user.tokenVersion !== decoded.version) {
            return res.status(401).send({ 
                success: false, 
                msg: "Session expired due to security update. Please login again." 
            });
        }

        req.user = user;
        next(); // Authorization successful
    } catch (err) {
        return res.status(401).send({ success: false, msg: "Invalid or Expired Token" });
    }
};

module.exports = { requireAuth };