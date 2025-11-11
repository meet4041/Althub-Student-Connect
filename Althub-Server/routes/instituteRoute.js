const express = require("express");
const institute_route = express();
const bodyParser = require("body-parser");
institute_route.use(bodyParser.json());
institute_route.use(bodyParser.urlencoded({ extended: true }));
// use the centralized DB helper so uploads go directly into GridFS
const { uploadSingle } = require('../db/storage');

institute_route.use(express.static('public'));
const institute_controller = require("../controllers/instituteController");

institute_route.post('/registerInstitute', institute_controller.registerInstitute);
institute_route.post('/instituteLogin', institute_controller.instituteLogin);
institute_route.post('/instituteUpdatePassword', institute_controller.instituteUpdatePassword);
institute_route.post('/instituteForgetPassword', institute_controller.instituteForgetPassword);
institute_route.post('/instituteResetPassword', institute_controller.instituteResetPassword);
institute_route.post('/instituteUpdate', institute_controller.updateInstitute);
institute_route.delete('/deleteInstitute/:id', institute_controller.deleteInstitute);
institute_route.get('/getInstitutes', institute_controller.getInstitues);
institute_route.get('/getInstituteById/:_id', institute_controller.searchInstituteById);
institute_route.post('/inviteUser', institute_controller.inviteUser);

// upload institute image to GridFS using multer-gridfs storage
institute_route.post('/uploadInstituteImage', uploadSingle('image'), (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ success: false, msg: 'No file provided' });
        // multer-gridfs-storage attaches file info on req.file; id may be in .id or ._id depending on storage
        const fileId = (req.file && (req.file.id || req.file._id)) ? (req.file.id || req.file._id).toString() : null;
        if (!fileId) return res.status(500).send({ success: false, msg: 'Uploaded but could not retrieve file id' });
        return res.status(200).send({ success: true, data: { url: `/api/images/${fileId}` } });
    } catch (err) {
        console.error('GridFS upload error', err.message);
        return res.status(500).send({ success: false, msg: err.message });
    }
});

module.exports = institute_route;