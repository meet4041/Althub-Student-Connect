import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { requireAuth } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { uploadSingle } from '../db/conn.js';
import education_controller from "../controllers/educationController.js";
import { badRequest } from "../utils/httpError.js";

const education_route = express.Router();

education_route.use(bodyParser.json());
education_route.use(bodyParser.urlencoded({ extended: true }));
education_route.use(cookieParser());

// Education routes
education_route.post('/addEducation', education_controller.addEducation);
education_route.post('/getEducation', education_controller.getEducation);
education_route.delete('/deleteEducation/:id', education_controller.deleteEducation);
education_route.post('/editEducation', education_controller.editEducation);
// Collage logos: 5MB max
education_route.post('/uploadCollageLogo', uploadSingle('collagelogo', { maxFileSize: 5 * 1024 * 1024 }), asyncHandler(async (req, res) => {
    if (!req.file) throw badRequest('No file provided');
    const fileId = req.file.id || req.file._id || (req.file.fileId && req.file.fileId.toString());
    return res.status(200).send({ success: true, data: { url: `/api/images/${fileId}` } });
}));

export default education_route;
