import express from "express";
import path from 'path';
import multer from 'multer';
import { requireAuth } from "../middleware/authMiddleware.js";
import institute_controller from "../controllers/instituteController.js";

const institute_route = express.Router();

// Multer Memory Storage Configuration - allows req.file.buffer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- PUBLIC ROUTES ---
institute_route.post('/registerInstitute', institute_controller.registerInstitute);
institute_route.post('/instituteLogin', institute_controller.instituteLogin);

// --- PROTECTED ROUTES ---
institute_route.get('/getInstitutes', institute_controller.getInstitues);
institute_route.post('/instituteUpdatePassword', requireAuth, institute_controller.instituteUpdatePassword);
institute_route.post('/instituteUpdate', requireAuth, institute_controller.updateInstitute);
institute_route.delete('/deleteInstitute/:id', requireAuth, institute_controller.deleteInstitute);
institute_route.get('/getInstituteById/:_id', requireAuth, institute_controller.getInstituteById);
institute_route.post('/inviteUser', requireAuth, institute_controller.inviteUser);

// --- PASSWORD RECOVERY (Public) ---
institute_route.post('/instituteForgetPassword', institute_controller.instituteForgetPassword);
institute_route.post('/instituteResetPassword', institute_controller.instituteResetPassword);

// --- IMAGE UPLOAD (Updated) ---
institute_route.post('/uploadInstituteImage', requireAuth, upload.single('image'), institute_controller.uploadInstituteImage);

export default institute_route;