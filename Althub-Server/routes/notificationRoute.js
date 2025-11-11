const express = require("express");
const notification_route = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { requireAuth } = require("../middleware/authMiddleware");
notification_route.use(bodyParser.json());
notification_route.use(bodyParser.urlencoded({ extended: true }));
notification_route.use(cookieParser());
notification_route.use(express.static('public'));
const multer = require("multer");
const gridfs = require('../db/storage');

notification_route.use(express.static('public'));

// memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });
const notification_controller = require("../controllers/notificationController");

//Company routes
notification_route.post('/addNotification', notification_controller.addNotification);
notification_route.post('/getnotifications', notification_controller.getnotifications);
// upload notification sender image to GridFS
notification_route.post('/uploadNotificationSenderImage', upload.single('senderimage'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ success: false, msg: 'No file provided' });
        const id = await gridfs.uploadFromBuffer(req.file.buffer, req.file.originalname, req.file.mimetype);
        return res.status(200).send({ success: true, data: { url: `/api/images/${id}` } });
    } catch (err) {
        console.error('GridFS upload error', err.message);
        return res.status(500).send({ success: false, msg: err.message });
    }
});

module.exports = notification_route;