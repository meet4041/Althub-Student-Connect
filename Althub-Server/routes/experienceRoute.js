import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { uploadSingle, uploadFromBuffer } from '../db/conn.js';
import experience_controller from "../controllers/experienceController.js";

const experience_route = express.Router();

experience_route.use(bodyParser.json());
experience_route.use(bodyParser.urlencoded({ extended: true }));
experience_route.use(express.static('public'));
experience_route.use(cookieParser());

// Experience routes
experience_route.post('/addExperience', experience_controller.addExperience);
experience_route.post('/getExperience', experience_controller.getExperience);
experience_route.delete('/deleteExperience/:id', experience_controller.deleteExperience);
experience_route.post('/editExperience', experience_controller.editExperience);

// --- COMPANY LOGO UPLOAD (Fixed to use GridFS) ---
// Company logos: 5MB max
experience_route.post('/uploadCompanyLogo', uploadSingle('companylogo', { maxFileSize: 5 * 1024 * 1024 }), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ success: false, msg: 'No file provided' });
        
        // Upload buffer to GridFS
        const fileId = await uploadFromBuffer(
            req.file.buffer, 
            req.file.originalname, 
            req.file.mimetype
        );
        
        return res.status(200).send({ success: true, data: { url: `/api/images/${fileId}` } });
    } catch (err) {
        console.error('Error uploading company logo', err.message);
        return res.status(500).send({ success: false, msg: err.message });
    }
});

export default experience_route;