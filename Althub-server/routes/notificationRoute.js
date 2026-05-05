import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import multer from "multer";
import { requireAuth } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import notification_controller from "../controllers/notificationController.js";
import * as gridfs from '../db/conn.js';
import { badRequest } from "../utils/httpError.js";

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
notification_route.post('/uploadNotificationSenderImage', upload.single('senderimage'), asyncHandler(async (req, res) => {
    if (!req.file) throw badRequest('No file provided');
    const id = await gridfs.uploadFromBuffer(req.file.buffer, req.file.originalname, req.file.mimetype);
    return res.status(200).send({ success: true, data: { url: `/api/images/${id}` } });
}));

export default notification_route;
