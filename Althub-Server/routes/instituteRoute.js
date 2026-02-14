import express from "express";
import path from 'path';
import multer from 'multer';
import rateLimit from "express-rate-limit";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import institute_controller from "../controllers/instituteController.js";

const institute_route = express.Router();

// Multer Memory Storage Configuration - allows req.file.buffer
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ok = /image\/(jpeg|png|gif|webp)/.test(file.mimetype);
        if (!ok) return cb(new Error('Only image files are allowed'));
        cb(null, true);
    }
});
const csvUpload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ok = file.mimetype === 'text/csv' || file.originalname.toLowerCase().endsWith('.csv');
        if (!ok) return cb(new Error('Only CSV files are allowed'));
        cb(null, true);
    }
});

// ==============================
// PUBLIC ROUTES (No Login Required)
// ==============================
institute_route.post('/registerInstitute', institute_controller.registerInstitute);
institute_route.post('/instituteLogin', institute_controller.instituteLogin);

// [MOVED HERE] This allows the Registration Dropdown to load institutes before logging in
institute_route.get('/getInstitutes', institute_controller.getInstitutes);

// --- PASSWORD RECOVERY (Public) ---
const forgetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, msg: "Too many reset requests. Try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

const uploadLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 30,
    message: { success: false, msg: "Too many upload requests. Try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

institute_route.post('/instituteForgetPassword', forgetLimiter, institute_controller.instituteForgetPassword);
institute_route.post('/instituteResetPassword', institute_controller.instituteResetPassword);
institute_route.get('/instituteLogout', requireAuth, requireRole('institute', 'alumni_office', 'placement_cell'), institute_controller.instituteLogout);


// ==============================
// PROTECTED ROUTES (Login Required)
// ==============================
institute_route.post('/instituteUpdatePassword', requireAuth, requireRole('institute', 'alumni_office', 'placement_cell'), institute_controller.instituteUpdatePassword);
institute_route.post('/instituteUpdate', requireAuth, requireRole('institute', 'alumni_office', 'placement_cell'), institute_controller.updateInstitute);
institute_route.delete('/deleteInstitute/:id', requireAuth, requireRole('institute', 'alumni_office', 'placement_cell'), institute_controller.deleteInstitute);
institute_route.get('/getInstituteById/:_id', requireAuth, requireRole('institute', 'alumni_office', 'placement_cell'), institute_controller.getInstituteById);
institute_route.get('/getAlumniOfficeByInstitute/:instituteId', requireAuth, requireRole('institute', 'alumni_office'), institute_controller.getAlumniOfficeByInstitute);
institute_route.get('/getPlacementCellByInstitute/:instituteId', requireAuth, requireRole('institute', 'placement_cell'), institute_controller.getPlacementCellByInstitute);
institute_route.post('/inviteUser', requireAuth, requireRole('institute'), institute_controller.inviteUser);
institute_route.post('/bulkInviteAlumniCsv', requireAuth, requireRole('institute', 'alumni_office'), uploadLimiter, csvUpload.single('file'), institute_controller.bulkInviteAlumniCsv);

// --- IMAGE UPLOAD (Protected) ---
institute_route.post('/uploadInstituteImage', requireAuth, requireRole('institute', 'alumni_office', 'placement_cell'), uploadLimiter, upload.single('image'), institute_controller.uploadInstituteImage);

export default institute_route;
