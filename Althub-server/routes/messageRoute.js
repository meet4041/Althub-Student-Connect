import express from "express";
import bodyParser from "body-parser";
import { requireAuth } from "../middleware/authMiddleware.js";
import message_controller from "../controllers/messageController.js";

const message_route = express.Router();

message_route.use(bodyParser.json());
message_route.use(bodyParser.urlencoded({ extended: true }));

message_route.post('/newMessage', requireAuth, message_controller.newMessage);
message_route.get('/getMessages/:conversationId', requireAuth, message_controller.getMessages);

// --- NEW ROUTES ---
message_route.get('/countMessages/:conversationId/:senderId', requireAuth, message_controller.countMessages);
message_route.put('/markMessagesRead/:conversationId/:senderId', requireAuth, message_controller.markMessagesRead);

export default message_route;