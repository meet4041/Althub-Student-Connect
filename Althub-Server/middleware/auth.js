const jwt = require("jsonwebtoken");
const config = require("../config/config");

const requireAuth = (req, res, next) => {
    // Check for token in cookies or authorization header
    const token = req.cookies.institute_token || req.cookies.jwt_token || req.headers["authorization"];

    if (token) {
        jwt.verify(token, config.secret_jwt, (err, decodedToken) => {
            if (err) {
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