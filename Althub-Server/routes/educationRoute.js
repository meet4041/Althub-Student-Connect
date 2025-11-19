const express = require("express");
const education_route = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { requireAuth } = require("../middleware/authMiddleware");
education_route.use(bodyParser.json());
education_route.use(bodyParser.urlencoded({ extended: true }));
education_route.use(cookieParser());
education_route.use(express.static('public'));
const { uploadSingle } = require('../db/storage');
const education_controller = require("../controllers/educationController");

//Education routes
education_route.post('/addEducation', education_controller.addEducation);
education_route.post('/getEducation', education_controller.getEducation);
education_route.delete('/deleteEducation/:id', education_controller.deleteEducation);
education_route.post('/editEducation', education_controller.editEducation);
education_route.post('/uploadCollageLogo', uploadSingle('collagelogo'), (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ success: false, msg: 'No file provided' });
        const fileId = req.file.id || req.file._id || (req.file.fileId && req.file.fileId.toString());
        return res.status(200).send({ success: true, data: { url: `/api/images/${fileId}` } });
    } catch (err) {
        console.error('Error uploading collage logo', err.message);
        return res.status(500).send({ success: false, msg: err.message });
    }
});

module.exports = education_route;