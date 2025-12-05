const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel"); // 1. Import Message Model

const newConversation = async (req, res) => {
    const newconversation = new Conversation({
        members: [req.body.senderId, req.body.receiverId]
    });
    try {
        const savedConversation = await newconversation.save();
        res.status(200).send({ success: true, data: savedConversation });
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
};

const getConversation = async (req, res) => {
    try {
        // 1. Get all conversations for the user
        const conversations = await Conversation.find({
            members: { $in: [req.params.userId] }
        }).sort({ updatedAt: -1 });

        // 2. Filter: Only keep conversations that have at least one message
        const activeConversations = [];
        
        for (const conv of conversations) {
            // Check if any message exists for this conversation ID
            const hasMessage = await Message.exists({ conversationId: conv._id });
            
            if (hasMessage) {
                activeConversations.push(conv);
            }
        }

        // Return only the conversations with messages
        res.status(200).send({ success: true, data: activeConversations });

    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
}

const searchConversation = async (req, res) => {
    try {
        const conversation = await Conversation.find({
            members: { $all: [req.body.person1 ,req.body.person2] }
        });
        res.status(200).send({ success: true, data: conversation });
    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
}

module.exports = {
    newConversation,
    getConversation,
    searchConversation
}