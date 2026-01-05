import Message from "../models/messageModel.js";
import Notification from "../models/notificationModel.js";
import Conversation from "../models/conversationModel.js";
import User from "../models/userModel.js";

const newMessage = async (req, res) => {
    const newMessage = new Message(req.body);
    try {
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
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
};

const getMessages = async (req, res) => {
    try {
        // --- OPTIMIZATION: .lean() added ---
        const messages = await Message.find({
            conversationId: req.params.conversationId
        }).lean();
        res.status(200).send({ success: true, data: messages });
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
}

const countMessages = async (req, res) => {
    try {
        const count = await Message.countDocuments({
            conversationId: req.params.conversationId,
            sender: req.params.senderId,
            isRead: { $ne: true } 
        });
        res.status(200).send({ success: true, count: count });
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
}

const markMessagesRead = async (req, res) => {
    try {
        await Message.updateMany(
            { 
                conversationId: req.params.conversationId, 
                sender: req.params.senderId
            },
            { $set: { isRead: true } }
        );
        res.status(200).send({ success: true, msg: "Messages marked as read" });
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
}

export default {
    newMessage,
    getMessages,
    countMessages,
    markMessagesRead
};