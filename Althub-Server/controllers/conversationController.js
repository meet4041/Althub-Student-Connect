const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");

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
        // --- OPTIMIZATION 1: Use .lean() for faster read ---
        const conversations = await Conversation.find({
            members: { $in: [req.params.userId] }
        }).sort({ updatedAt: -1 }).lean();

        // --- OPTIMIZATION 2: Fix N+1 Problem (Parallel Execution) ---
        // Instead of waiting for one check to finish before starting the next, run all in parallel
        const existenceChecks = await Promise.all(
            conversations.map((conv) => 
                Message.exists({ conversationId: conv._id })
            )
        );

        // Filter conversations based on the parallel results
        const activeConversations = conversations.filter((_, index) => existenceChecks[index]);

        res.status(200).send({ success: true, data: activeConversations });

    } catch (error) {
        res.status(500).send({ success: false, msg: error.message });
    }
}

const searchConversation = async (req, res) => {
    try {
        // --- OPTIMIZATION: .lean() ---
        const conversation = await Conversation.find({
            members: { $all: [req.body.person1 ,req.body.person2] }
        }).lean();
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