import express from "express";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import multer from "multer";

// Import Middleware
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

// Import DB Connection directly (Storage file was deleted)
import { uploadFromBuffer } from '../db/conn.js';

// Import Controller (using namespace import to keep existing syntax working)
import * as admin_controller from "../controllers/adminController.js";

// Initialize Router
const admin_route = express.Router();

admin_route.use(cookieParser());
admin_route.use(express.json());
admin_route.use(express.urlencoded({ extended: true }));
// Static files shouldn't usually be served from a route file, but keeping your logic:
// (It's better to move this to index.js if possible)
// admin_route.use(express.static('public'));

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
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ok = /image\/(jpeg|png|gif|webp)/.test(file.mimetype);
        if (!ok) return cb(new Error('Only image files are allowed'));
        cb(null, true);
    }
});

const uploadLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 30,
    message: { success: false, msg: "Too many upload requests. Try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

// --- ROUTES ---

admin_route.post('/adminLogin', admin_controller.adminLogin); 

admin_route.post('/updatepassword', requireAuth, requireRole('admin'), admin_controller.updatePassword);

// Apply the limiter specifically to the forget password route
admin_route.post('/forgetpassword', resetPasswordLimiter, admin_controller.forgetPassword);

admin_route.get('/resetpassword', admin_controller.resetpassword);

admin_route.post('/adminUpdate', requireAuth, requireRole('admin'), admin_controller.updateAdmin);

admin_route.get('/adminLogout', requireAuth, requireRole('admin'), admin_controller.adminLogout);

admin_route.post('/uploadAdminImage', requireAuth, requireRole('admin'), uploadLimiter, upload.single('profilepic'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ success: false, msg: 'No file provided' });
        
        // Use the function imported from conn.js
        const id = await uploadFromBuffer(req.file.buffer, req.file.originalname, req.file.mimetype);
        
        return res.status(200).send({ success: true, data: { url: `/api/images/${id}` } });
    } catch (err) {
        console.error('GridFS upload error', err.message);
        return res.status(500).send({ success: false, msg: err.message });
    }
});
// Add this route to adminRoute.js
admin_route.get('/getUsersByInstitute/:instituteId', requireAuth, requireRole('admin'), admin_controller.getUsersByInstitute);
// Add to adminRoute.js
admin_route.get('/getUsersByInstName/:instituteName', requireAuth, requireRole('admin'), admin_controller.getUsersByInstituteName);
admin_route.get('/getAdminById/:_id', requireAuth, requireRole('admin'), admin_controller.getAdminById);

export default admin_route;
