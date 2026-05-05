import Notification from "../models/notificationModel.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { badRequest } from "../utils/httpError.js";

// 1. Upload Image
const uploadNotificationSenderImage = asyncHandler(async (req, res) => {
    if (!req.file) throw badRequest("plz select a file");

    const picture = {
        url: '/notificationSenderImages/' + req.file.filename,
    };
    res.status(200).send({ success: true, data: picture });
});

// 2. Add Notification
const addNotification = asyncHandler(async (req, res) => {
    const notification = new Notification({
        userid: req.body.userid,       // The Receiver's ID
        senderId: req.body.senderId,   // <--- ADDED: Sender ID for profile redirect
        msg: req.body.msg,
        image: req.body.image,
        title: req.body.title,
        date: req.body.date || new Date().toISOString(),
    });
    const notification_data = await notification.save();
    res.status(200).send({ success: true, data: notification_data });
});

// 3. Get Notifications (Renamed to lowercase 'getnotifications' to fix the crash)
const getnotifications = asyncHandler(async (req, res) => {
    const { userid } = req.body;

    if (!userid) {
        throw badRequest("User ID is required");
    }

    const notifications = await Notification.find({ userid: userid })
        // Sort by Date Descending (-1) so newest is top.
        // secondary sort by _id Descending (-1) for strict LIFO (Last In First Out)
        .sort({ date: -1, _id: -1 });

    res.status(200).send({ success: true, data: notifications });
});

// 4. Delete Notification
const deleteNotification = asyncHandler(async (req, res) => {
    const { notificationId } = req.body;
    if (!notificationId) {
        throw badRequest("Notification ID is required");
    }

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).send({ success: true, msg: "Notification deleted successfully" });
});

// EXPORTS
export default {
    uploadNotificationSenderImage,
    addNotification,
    getnotifications, // This must match the variable name defined above
    deleteNotification
};
