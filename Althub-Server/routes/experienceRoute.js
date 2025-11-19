const express = require("express");
const experience_route = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
experience_route.use(bodyParser.json());
experience_route.use(bodyParser.urlencoded({ extended: true }));
const { uploadSingle } = require('../db/storage');
experience_route.use(express.static('public'));
experience_route.use(cookieParser());
const experience_controller = require("../controllers/experienceController");

//Education routes
experience_route.post('/addExperience', experience_controller.addExperience);
experience_route.post('/getExperience', experience_controller.getExperience);
experience_route.delete('/deleteExperience/:id', experience_controller.deleteExperience);
experience_route.post('/editExperience', experience_controller.editExperience);
experience_route.post('/uploadCompanyLogo', uploadSingle('companylogo'), (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ success: false, msg: 'No file provided' });
        const fileId = req.file.id || req.file._id || (req.file.fileId && req.file.fileId.toString());
        return res.status(200).send({ success: true, data: { url: `/api/images/${fileId}` } });
    } catch (err) {
        console.error('Error uploading company logo', err.message);
        return res.status(500).send({ success: false, msg: err.message });
    }
});

module.exports = experience_route;