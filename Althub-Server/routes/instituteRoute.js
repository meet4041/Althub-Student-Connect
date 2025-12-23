const express = require("express");
const institute_route = express.Router(); 
const { requireAuth } = require("../middleware/authMiddleware"); // CRITICAL: Use version-checking middleware
const { uploadSingle } = require('../db/storage');
const institute_controller = require("../controllers/instituteController");

// --- PUBLIC ROUTES ---
institute_route.post('/registerInstitute', institute_controller.registerInstitute);
institute_route.post('/instituteLogin', institute_controller.instituteLogin);
institute_route.get('/getInstitutes', institute_controller.getInstitues);

// --- PROTECTED ROUTES (Enforces Global Logout) ---
// Note: We use requireAuth here. If the password was changed in another browser,
// these routes will return 401 and force a logout.
institute_route.post('/instituteUpdatePassword', requireAuth, institute_controller.instituteUpdatePassword);
institute_route.post('/instituteUpdate', requireAuth, institute_controller.updateInstitute);
institute_route.delete('/deleteInstitute/:id', requireAuth, institute_controller.deleteInstitute);
institute_route.get('/getInstituteById/:_id', requireAuth, institute_controller.getInstituteById);
institute_route.post('/inviteUser', requireAuth, institute_controller.inviteUser);

// --- PASSWORD RECOVERY (Public) ---
institute_route.post('/instituteForgetPassword', institute_controller.instituteForgetPassword);
institute_route.post('/instituteResetPassword', institute_controller.instituteResetPassword);

// --- IMAGE UPLOAD (Protected) ---
institute_route.post('/uploadInstituteImage', requireAuth, uploadSingle('image'), (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ success: false, msg: 'No file provided' });
        
        const fileId = (req.file && (req.file.id || req.file._id)) 
            ? (req.file.id || req.file._id).toString() 
            : null;
            
        if (!fileId) return res.status(500).send({ success: false, msg: 'Upload successful, but file ID missing' });
        
        return res.status(200).send({ success: true, data: { url: `/api/images/${fileId}` } });
    } catch (err) {
        console.error('GridFS upload error:', err.message);
        return res.status(500).send({ success: false, msg: err.message });
    }
});

module.exports = institute_route;