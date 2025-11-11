const express = require("express");
const admin_route = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
admin_route.use(cookieParser());
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true }));
const multer = require("multer");
const gridfs = require('../db/storage');
admin_route.use(express.static('public'));

// memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });
const admin_controller = require("../controllers/adminController");

//admin routes
admin_route.post('/registerAdmin', admin_controller.registerAdmin);
admin_route.post('/adminLogin', admin_controller.adminlogin);
admin_route.post('/updatepassword', admin_controller.updatePassword);
admin_route.post('/forgetpassword', admin_controller.forgetPassword);
admin_route.get('/resetpassword', admin_controller.resetpassword);
admin_route.post('/adminUpdate', admin_controller.updateAdmin);
admin_route.get('/adminLogout', admin_controller.adminLogout);
// upload admin image to GridFS
admin_route.post('/uploadAdminImage', upload.single('profilepic'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ success: false, msg: 'No file provided' });
        const id = await gridfs.uploadFromBuffer(req.file.buffer, req.file.originalname, req.file.mimetype);
        return res.status(200).send({ success: true, data: { url: `/api/images/${id}` } });
    } catch (err) {
        console.error('GridFS upload error', err.message);
        return res.status(500).send({ success: false, msg: err.message });
    }
});
admin_route.get('/getAdminById/:_id', admin_controller.getAdminById);

module.exports = admin_route;