import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import multer from "multer";
import { requireAuth } from "../middleware/authMiddleware.js";
import notification_controller from "../controllers/notificationController.js";
import * as gridfs from '../db/conn.js';

const notification_route = express.Router();

notification_route.use(bodyParser.json());
notification_route.use(bodyParser.urlencoded({ extended: true }));
notification_route.use(cookieParser());

// memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Company routes
notification_route.post('/deleteNotification', notification_controller.deleteNotification);
notification_route.post('/addNotification', notification_controller.addNotification);
notification_route.post('/getnotifications', notification_controller.getnotifications);
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

export default notification_route;