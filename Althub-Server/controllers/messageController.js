const Message = require("../models/messageModel");
const Notification = require("../models/notificationModel");
const Conversation = require("../models/conversationModel");
const User = require("../models/userModel");

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
        const messages = await Message.find({
            conversationId: req.params.conversationId
        });
        res.status(200).send({ success: true, data: messages });
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
}

// --- 1. ROBUST COUNT (Counts anything NOT read) ---
const countMessages = async (req, res) => {
    try {
        const count = await Message.countDocuments({
            conversationId: req.params.conversationId,
            sender: req.params.senderId,
            isRead: { $ne: true } // Counts 'false' AND 'undefined' (legacy messages)
        });
        res.status(200).send({ success: true, count: count });
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
}

// --- 2. FORCE MARK AS READ ---
const markMessagesRead = async (req, res) => {
    try {
        // Update ALL messages from this sender in this chat to true
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

module.exports = {
    newMessage,
    getMessages,
    countMessages,
    markMessagesRead
}