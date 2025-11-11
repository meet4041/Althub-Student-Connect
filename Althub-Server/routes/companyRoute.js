const express = require("express");
const company_route = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { requireAuth } = require("../middleware/authMiddleware");

company_route.use(bodyParser.json());
company_route.use(bodyParser.urlencoded({ extended: true }));
company_route.use(cookieParser());
company_route.use(express.static('public'));
const { uploadSingle } = require('../db/storage');
const company_controller = require("../controllers/companyController");

//Company routes
company_route.post('/addCompany', company_controller.addCompany);
company_route.get('/getCompanies', company_controller.getCompanies);
company_route.delete('/deleteCompany/:id', company_controller.deleteCompany);
// upload company image to GridFS
// upload company image to GridFS using multer-gridfs-storage
company_route.post('/uploadCompanyImage', uploadSingle('image'), (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ success: false, msg: 'No file provided' });
        const fileId = req.file.id || req.file._id || (req.file.fileId && req.file.fileId.toString());
        return res.status(200).send({ success: true, data: { url: `/api/images/${fileId}` } });
    } catch (err) {
        console.error('Error uploading company image', err.message);
        return res.status(500).send({ success: false, msg: err.message });
    }
});

module.exports = company_route;