import express from "express";
import bodyParser from "body-parser";
import { requireAuth } from "../middleware/authMiddleware.js";
import conversation_controller from "../controllers/conversationController.js";

const conversation_route = express.Router();

conversation_route.use(bodyParser.json());
conversation_route.use(bodyParser.urlencoded({ extended: true }));

conversation_route.post('/newConversation', requireAuth, conversation_controller.newConversation);
conversation_route.get('/getConversations/:userId', requireAuth, conversation_controller.getConversation);
conversation_route.post('/searchConversations', requireAuth, conversation_controller.searchConversation);

export default conversation_route;