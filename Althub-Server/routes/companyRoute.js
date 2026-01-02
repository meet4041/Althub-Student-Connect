import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { requireAuth } from "../middleware/authMiddleware.js";
import { uploadSingle } from '../db/conn.js';
import company_controller from "../controllers/companyController.js";

const company_route = express.Router();

company_route.use(bodyParser.json());
company_route.use(bodyParser.urlencoded({ extended: true }));
company_route.use(cookieParser());

// Company routes
company_route.post('/addCompany', company_controller.addCompany);
company_route.get('/getCompanies', company_controller.getCompanies);
company_route.delete('/deleteCompany/:id', company_controller.deleteCompany);
// Company images: 5MB max
company_route.post('/uploadCompanyImage', uploadSingle('image', { maxFileSize: 5 * 1024 * 1024 }), (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ success: false, msg: 'No file provided' });
        const fileId = req.file.id || req.file._id || (req.file.fileId && req.file.fileId.toString());
        return res.status(200).send({ success: true, data: { url: `/api/images/${fileId}` } });
    } catch (err) {
        console.error('Error uploading company image', err.message);
        return res.status(500).send({ success: false, msg: err.message });
    }
});

export default company_route;