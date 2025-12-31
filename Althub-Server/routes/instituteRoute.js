const express = require("express");
const institute_route = express.Router();
const path = require('path');
const multer = require('multer'); // [ADDED] Import Multer
const { requireAuth } = require("../middleware/authMiddleware"); 
const institute_controller = require("../controllers/instituteController");

// [ADDED] Multer Memory Storage Configuration
// This allows us to access req.file.buffer in the controller
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
// Now uses 'upload.single' to handle the file and calls the controller function
institute_route.post('/uploadInstituteImage', requireAuth, upload.single('image'), institute_controller.uploadInstituteImage);

module.exports = institute_route;