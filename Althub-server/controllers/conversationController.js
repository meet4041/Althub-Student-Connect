import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const newConversation = asyncHandler(async (req, res) => {
    const newconversation = new Conversation({
        members: [req.body.senderId, req.body.receiverId]
    });

    const savedConversation = await newconversation.save();
    res.status(200).send({ success: true, data: savedConversation });
});

const getConversation = asyncHandler(async (req, res) => {
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
});

const searchConversation = asyncHandler(async (req, res) => {
    // --- OPTIMIZATION: .lean() ---
    const conversation = await Conversation.find({
        members: { $all: [req.body.person1, req.body.person2] }
    }).lean();
    res.status(200).send({ success: true, data: conversation });
});

export default {
    newConversation,
    getConversation,
    searchConversation
};
