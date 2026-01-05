import Notification from "../models/notificationModel.js";

// 1. Upload Image
const uploadNotificationSenderImage = async (req, res) => {
    try {
        if (req.file !== undefined) {
            const picture = ({
                url: '/notificationSenderImages/' + req.file.filename,
            });
            res.status(200).send({ success: true, data: picture });
        }
        else {
            res.status(200).send({ success: false, msg: "plz select a file" });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

// 2. Add Notification
const addNotification = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(400).send({ success: false, msg: "Error in Add notification" });
    }
}

// 3. Get Notifications (Renamed to lowercase 'getnotifications' to fix the crash)
const getnotifications = async (req, res) => {
    try {
        const { userid } = req.body;

        if (!userid) {
            return res.status(400).send({ success: false, msg: "User ID is required" });
        }

        const notifications = await Notification.find({ userid: userid })
            // Sort by Date Descending (-1) so newest is top.
            // secondary sort by _id Descending (-1) for strict LIFO (Last In First Out)
            .sort({ date: -1, _id: -1 });

        res.status(200).send({ success: true, data: notifications });
    } catch (error) {
        console.log("Error in getnotifications controller", error);
        res.status(500).send({ success: false, error: "Internal Server Error" });
    }
};

// 4. Delete Notification
const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.body;
        if (!notificationId) {
            return res.status(400).send({ success: false, msg: "Notification ID is required" });
        }
        
        await Notification.findByIdAndDelete(notificationId);
        
        res.status(200).send({ success: true, msg: "Notification deleted successfully" });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

// EXPORTS
export default {
    uploadNotificationSenderImage,
    addNotification,
    getnotifications, // This must match the variable name defined above
    deleteNotification
};