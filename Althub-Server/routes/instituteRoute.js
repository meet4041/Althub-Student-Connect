const express = require("express");
const institute_route = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser"); // SECURE: Added to handle JWT cookies
const auth = require("../middleware/auth"); // SECURE: Custom middleware to verify identity
const { uploadSingle } = require('../db/storage');
const requireAuth = require("../middleware/auth"); 

// Basic Middleware Configuration
institute_route.use(cookieParser()); // SECURE: Enables server to read secure cookies
institute_route.use(bodyParser.json());
institute_route.use(bodyParser.urlencoded({ extended: true }));
institute_route.use(express.static('public'));

const institute_controller = require("../controllers/instituteController");

// --- PUBLIC ROUTES ---
// Anyone can attempt to login or see the list of active institutes
institute_route.post('/registerInstitute', institute_controller.registerInstitute);
institute_route.post('/instituteLogin', institute_controller.instituteLogin);
institute_route.get('/getInstitutes', institute_controller.getInstitues);

// --- PROTECTED ROUTES ---
// These require a valid 'institute_token' in the cookies or header
institute_route.post('/instituteUpdatePassword', auth, institute_controller.instituteUpdatePassword);
institute_route.post('/instituteForgetPassword', institute_controller.instituteForgetPassword);
institute_route.post('/instituteResetPassword', institute_controller.instituteResetPassword);
institute_route.post('/instituteUpdate', requireAuth, institute_controller.updateInstitute);
institute_route.delete('/deleteInstitute/:id', auth, institute_controller.deleteInstitute);
institute_route.get('/getInstituteById/:_id', auth, institute_controller.searchInstituteById);
institute_route.post('/inviteUser', auth, institute_controller.inviteUser);

// Image Upload with basic check
institute_route.post('/uploadInstituteImage', uploadSingle('image'), (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ success: false, msg: 'No file provided' });
        
        const fileId = (req.file && (req.file.id || req.file._id)) 
            ? (req.file.id || req.file._id).toString() 
            : null;
            
        if (!fileId) return res.status(500).send({ success: false, msg: 'Uploaded but could not retrieve file id' });
        
        return res.status(200).send({ success: true, data: { url: `/api/images/${fileId}` } });
    } catch (err) {
        console.error('GridFS upload error', err.message);
        return res.status(500).send({ success: false, msg: err.message });
    }
});

module.exports = institute_route;