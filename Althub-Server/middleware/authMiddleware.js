const jwt = require("jsonwebtoken");
const config = require("../config/config");
const Institute = require("../models/instituteModel"); // Ensure this path is correct based on your folder structure
const Admin = require("../models/adminModel");         // Ensure this path is correct
const User = require("../models/userModel");           // Ensure this path is correct

const requireAuth = async (req, res, next) => {
    try {
        // 1. Extract Token (Updated to check URL query)
        const token = 
            (req.headers["authorization"] && req.headers["authorization"].split(" ")[1]) || 
            req.cookies.institute_token || 
            req.cookies.admin_token || 
            req.body.token ||
            req.query.token; // <--- ADD THIS LINE HERE

        if (!token) {
            return res.status(401).send({ success: false, msg: "Access Denied" });
        }

        // 2. Verify Token Signature
        const decoded = jwt.verify(token, config.secret_jwt);
        
        // 3. Find User (Checks all 3 collections since this is a shared middleware)
        // We strictly select '+tokenVersion' because it is usually hidden (select: false) in the schema
        let user = await Institute.findById(decoded._id).select("+tokenVersion");
        if (!user) user = await Admin.findById(decoded._id).select("+tokenVersion");
        if (!user) user = await User.findById(decoded._id).select("+tokenVersion");

        if (!user) {
            return res.status(401).send({ success: false, msg: "User account no longer exists" });
        }

        // 4. SECURITY CHECK: Token Version
        // This is the "Global Logout" feature.
        // If the version in the token (decoded.version) does not match the version in the DB (user.tokenVersion),
        // it means the password was changed or the user was forced to log out.
        const dbTokenVersion = user.tokenVersion || 0; // Default to 0 if field is missing
        const tokenPayloadVersion = decoded.version || 0;

        if (dbTokenVersion !== tokenPayloadVersion) {
            return res.status(401).send({ 
                success: false, 
                msg: "Session expired due to security update. Please login again." 
            });
        }

        // 5. Attach User to Request
        req.user = user;
        next(); 

    } catch (err) {
        return res.status(401).send({ success: false, msg: "Invalid or Expired Token" });
    }
};

module.exports = { requireAuth };