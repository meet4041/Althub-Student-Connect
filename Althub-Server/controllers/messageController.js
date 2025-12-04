const Message = require("../models/messageModel");
const Notification = require("../models/notificationModel"); // Import Notification
const User = require("../models/userModel");

const newMessage = async (req, res) => {
    const newMessage = new Message(req.body);
    try {
        const savedMessage = await newMessage.save();

        // --- NEW: Create Notification for Message ---
        // Assuming req.body contains 'sender' (id) and 'receiverId'
        if (req.body.receiverId) {
            const sender = await User.findById(req.body.sender);
            
            const notification = new Notification({
                userid: req.body.receiverId, // The person receiving the message
                senderid: req.body.sender,
                image: sender ? sender.profilepic : '',
                title: "New Message",
                msg: `${sender ? sender.fname : 'Someone'} sent you a message.`,
                date: new Date()
            });
            await notification.save();
        }
        // ---------------------------------------------

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

module.exports = {
    newMessage,
    getMessages
}