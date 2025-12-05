const express = require("express");
const message_route = express();
const bodyParser = require("body-parser");

message_route.use(bodyParser.json());
message_route.use(bodyParser.urlencoded({ extended: true }));
message_route.use(express.static('public'));

const message_controller = require("../controllers/messageController");

message_route.post('/newMessage', message_controller.newMessage);
message_route.get('/getMessages/:conversationId', message_controller.getMessages);

// --- NEW ROUTES ---
message_route.get('/countMessages/:conversationId/:senderId', message_controller.countMessages);
message_route.put('/markMessagesRead/:conversationId/:senderId', message_controller.markMessagesRead);

module.exports = message_route;