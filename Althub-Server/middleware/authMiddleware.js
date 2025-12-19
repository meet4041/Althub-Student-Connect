const jwt = require("jsonwebtoken");
const config = require("../config/config");

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt_token;
    if (token) {
        jwt.verify(token, config.secret_jwt, (err, decodedToken) => {
            if (err) {
                console.log("error in verify token(login first) : " + err.message);
                res.status(401).send({ success: false, msg: "Login First" });
            }
            else {
                // FIX: Attach the decoded user info to the request object
                // This allows controllers to see req.user._id
                req.user = decodedToken; 
                console.log("Authenticated User ID:", req.user._id);
                next();
            }
        });
    }
    else {
        console.log("No token found");
        res.status(401).send({ success: false, msg: "Authentication Required" });
    }
}

module.exports = { requireAuth }