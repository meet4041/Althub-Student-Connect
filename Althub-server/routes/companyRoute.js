import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { requireAuth } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { uploadSingle } from '../db/conn.js';
import company_controller from "../controllers/companyController.js";
import { badRequest } from "../utils/httpError.js";

const company_route = express.Router();

company_route.use(bodyParser.json());
company_route.use(bodyParser.urlencoded({ extended: true }));
company_route.use(cookieParser());

// Company routes
company_route.post('/addCompany', requireAuth, company_controller.addCompany);
company_route.get('/getCompanies', company_controller.getCompanies);
company_route.delete('/deleteCompany/:id', requireAuth, company_controller.deleteCompany);
// Company images: 5MB max
company_route.post('/uploadCompanyImage', requireAuth, uploadSingle('image', { maxFileSize: 5 * 1024 * 1024 }), asyncHandler(async (req, res) => {
    if (!req.file) throw badRequest('No file provided');
    const fileId = req.file.id || req.file._id || (req.file.fileId && req.file.fileId.toString());
    return res.status(200).send({ success: true, data: { url: `/api/images/${fileId}` } });
}));

export default company_route;
