const express = require("express");
const institute_route = express.Router(); // FIX: Use Router() instead of express()
const auth = require("../middleware/auth"); 
const { uploadSingle } = require('../db/storage');

const institute_controller = require("../controllers/instituteController");

// --- PUBLIC ROUTES ---
institute_route.post('/registerInstitute', institute_controller.registerInstitute);
institute_route.post('/instituteLogin', institute_controller.instituteLogin);
institute_route.get('/getInstitutes', institute_controller.getInstitues);

// --- PROTECTED ROUTES ---
institute_route.post('/instituteUpdatePassword', auth, institute_controller.instituteUpdatePassword);
institute_route.post('/instituteForgetPassword', institute_controller.instituteForgetPassword);
institute_route.post('/instituteResetPassword', institute_controller.instituteResetPassword);
institute_route.post('/instituteUpdate', auth, institute_controller.updateInstitute);
institute_route.delete('/deleteInstitute/:id', auth, institute_controller.deleteInstitute);
institute_route.get('/getInstituteById/:_id', auth, institute_controller.searchInstituteById);
institute_route.post('/inviteUser', auth, institute_controller.inviteUser);

// Image Upload
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