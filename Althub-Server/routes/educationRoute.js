import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { requireAuth } from "../middleware/authMiddleware.js";
import { uploadSingle } from '../db/conn.js';
import education_controller from "../controllers/educationController.js";

const education_route = express.Router();

education_route.use(bodyParser.json());
education_route.use(bodyParser.urlencoded({ extended: true }));
education_route.use(cookieParser());

// Education routes
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

export default education_route;