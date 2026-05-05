import express from "express";
import bodyParser from "body-parser";
import conversation_controller from "../controllers/conversationController.js";

const conversation_route = express.Router();

conversation_route.use(bodyParser.json());
conversation_route.use(bodyParser.urlencoded({ extended: true }));

conversation_route.post('/newConversation', conversation_controller.newConversation);
conversation_route.get('/getConversations/:userId', conversation_controller.getConversation);
conversation_route.post('/searchConversations', conversation_controller.searchConversation);

export default conversation_route;