const express = require("express");
const admin_route = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const auth = require("../middleware/auth"); // ADDED: Import Auth Middleware

admin_route.use(cookieParser());
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true }));
const multer = require("multer");
const gridfs = require('../db/storage');
admin_route.use(express.static('public'));

// Define the rate limit rule: 5 requests per 1 minute
const resetPasswordLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 5, 
    message: {
        success: false,
        msg: "Too many reset requests. Please try again after a minute."
    },
    standardHeaders: true, 
    legacyHeaders: false, 
});

const storage = multer.memoryStorage();
const upload = multer({ storage });
const admin_controller = require("../controllers/adminController");

// admin routes
admin_route.post('/adminLogin', admin_controller.adminLogin); 

// SECURED: Added 'auth' middleware so only logged-in admins can update passwords
admin_route.post('/updatepassword', auth, admin_controller.updatePassword);

// Apply the limiter specifically to the forget password route
admin_route.post('/forgetpassword', resetPasswordLimiter, admin_controller.forgetPassword);

admin_route.get('/resetpassword', admin_controller.resetpassword);

// SECURED: Added 'auth' middleware to protect profile updates
admin_route.post('/adminUpdate', auth, admin_controller.updateAdmin);

admin_route.get('/adminLogout', admin_controller.adminLogout);

// SECURED: Added 'auth' middleware to protect image uploads
admin_route.post('/uploadAdminImage', auth, upload.single('profilepic'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ success: false, msg: 'No file provided' });
        const id = await gridfs.uploadFromBuffer(req.file.buffer, req.file.originalname, req.file.mimetype);
        return res.status(200).send({ success: true, data: { url: `/api/images/${id}` } });
    } catch (err) {
        console.error('GridFS upload error', err.message);
        return res.status(500).send({ success: false, msg: err.message });
    }
});

// SECURED: Added 'auth' middleware. This is the specific fix for your issue.
admin_route.get('/getAdminById/:_id', auth, admin_controller.getAdminById);

module.exports = admin_route;