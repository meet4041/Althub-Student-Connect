import express from "express";
import bodyParser from "body-parser";
import message_controller from "../controllers/messageController.js";

const message_route = express.Router();

message_route.use(bodyParser.json());
message_route.use(bodyParser.urlencoded({ extended: true }));

message_route.post('/newMessage', message_controller.newMessage);
message_route.get('/getMessages/:conversationId', message_controller.getMessages);

// --- NEW ROUTES ---
message_route.get('/countMessages/:conversationId/:senderId', message_controller.countMessages);
message_route.put('/markMessagesRead/:conversationId/:senderId', message_controller.markMessagesRead);

export default message_route;