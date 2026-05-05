import Message from "../models/messageModel.js";
import Notification from "../models/notificationModel.js";
import Conversation from "../models/conversationModel.js";
import User from "../models/userModel.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const newMessage = asyncHandler(async (req, res) => {
    const newMessage = new Message(req.body);
    const savedMessage = await newMessage.save();

    await Conversation.findByIdAndUpdate(
        req.body.conversationId,
        { $set: { updatedAt: new Date() } },
        { new: true }
    );

    if (req.body.receiverId) {
        const sender = await User.findById(req.body.sender);

        const notification = new Notification({
            userid: req.body.receiverId,
            senderid: req.body.sender,
            image: sender ? sender.profilepic : '',
            title: "New Message",
            msg: `${sender ? sender.fname : 'Someone'} sent you a message.`,
            date: new Date()
        });
        await notification.save();
    }

    res.status(200).send({ success: true, data: savedMessage });
});

const getMessages = asyncHandler(async (req, res) => {
    // --- OPTIMIZATION: .lean() added ---
    const messages = await Message.find({
        conversationId: req.params.conversationId
    }).lean();
    res.status(200).send({ success: true, data: messages });
});

const countMessages = asyncHandler(async (req, res) => {
    const count = await Message.countDocuments({
        conversationId: req.params.conversationId,
        sender: req.params.senderId,
        isRead: { $ne: true }
    });
    res.status(200).send({ success: true, count: count });
});

const markMessagesRead = asyncHandler(async (req, res) => {
    await Message.updateMany(
        {
            conversationId: req.params.conversationId,
            sender: req.params.senderId
        },
        { $set: { isRead: true } }
    );
    res.status(200).send({ success: true, msg: "Messages marked as read" });
});

export default {
    newMessage,
    getMessages,
    countMessages,
    markMessagesRead
};
