const express = require("express");
const feedback_route = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// Import your security middleware
const { requireAuth } = require("../middleware/authMiddleware");

// Middleware setup
feedback_route.use(bodyParser.json());
feedback_route.use(bodyParser.urlencoded({ extended: true }));
feedback_route.use(cookieParser());
feedback_route.use(express.static('public'));

const feedback_controller = require("../controllers/feedbackController");

/**
 * FEEDBACK ROUTES
 */

// PUBLIC: Allows any user/student to submit feedback
feedback_route.post('/addFeedback', feedback_controller.addFeedback);

// SECURE: Only authenticated Admins/Institutes can fetch the list of feedback
// The requireAuth middleware will validate the JWT before allowing access
feedback_route.get('/getFeedback', requireAuth, feedback_controller.getFeedback);

// SECURE: Only authenticated Admins/Institutes can delete feedback entries
feedback_route.delete('/deleteFeedback/:id', requireAuth, feedback_controller.deleteFeedback);

module.exports = feedback_route;