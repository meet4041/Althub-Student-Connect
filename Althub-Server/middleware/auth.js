const jwt = require("jsonwebtoken");
const config = require("../config/config");

const requireAuth = (req, res, next) => {
    // 1. Get token from Cookies OR Headers
    let token = req.cookies.institute_token || req.cookies.jwt_token || req.headers["authorization"];

    // 2. Fix: Handle "Bearer " prefix if present in the header
    if (token && typeof token === 'string' && token.startsWith("Bearer ")) {
        token = token.slice(7, token.length);
    }

    if (token) {
        // 3. Verify the clean token
        jwt.verify(token, config.secret_jwt, (err, decodedToken) => {
            if (err) {
                // This error causes the redirect loop on the client
                console.log("Auth Failed: Invalid Token"); 
                return res.status(401).send({ success: false, msg: "Session Expired" });
            } else {
                req.user = decodedToken;
                next();
            }
        });
    } else {
        res.status(401).send({ success: false, msg: "Authentication Required" });
    }
}

module.exports = requireAuth;