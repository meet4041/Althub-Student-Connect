const jwt = require("jsonwebtoken");
const config = require("../config/config");

const requireAuth = (req, res, next) => {
    // SECURE: Check for tokens in cookies
    // The 400 error in your screenshot often happens if the 'institute_token' 
    // is expected but not found or formatted incorrectly.
    const token = req.cookies.institute_token || req.cookies.jwt_token;

    if (token) {
        jwt.verify(token, config.secret_jwt, (err, decodedToken) => {
            if (err) {
                console.error("Token verification failed:", err.message);
                return res.status(401).send({ success: false, msg: "Login Session Expired" });
            } else {
                req.user = decodedToken;
                next();
            }
        });
    } else {
        // If no token is found, we send a 401, not a 400.
        res.status(401).send({ success: false, msg: "Authentication Required" });
    }
}

module.exports = { requireAuth };