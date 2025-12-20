const jwt = require("jsonwebtoken");
const config = require("../config/config");
const Admin = require("../models/adminModel");
const Institute = require("../models/instituteModel");

const requireAuth = async (req, res, next) => {
    // 1. IMPROVED: Check Cookies FIRST, then check Headers as a backup
    const token = req.cookies.institute_token || 
                  req.cookies.jwt_token || 
                  (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);

    if (!token) {
        return res.status(401).send({ success: false, msg: "Authentication Required" });
    }

    try {
        const decoded = jwt.verify(token, config.secret_jwt);

        // Session validation (The versioning check you already have)
        let user = await Admin.findById(decoded._id).select("+tokenVersion");
        if (!user) {
            user = await Institute.findById(decoded._id).select("+tokenVersion");
        }

        if (!user || user.tokenVersion !== decoded.version) {
            return res.status(401).send({ 
                success: false, 
                msg: "Session expired. Please login again." 
            });
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).send({ success: false, msg: "Invalid or Expired Token" });
    }
};

module.exports = { requireAuth };