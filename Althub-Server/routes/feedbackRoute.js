import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { requireAuth } from "../middleware/authMiddleware.js";
import feedback_controller from "../controllers/feedbackController.js";

const feedback_route = express.Router();

// Middleware setup
feedback_route.use(bodyParser.json());
feedback_route.use(bodyParser.urlencoded({ extended: true }));
feedback_route.use(cookieParser());

/**
 * FEEDBACK ROUTES
 */

// PUBLIC: Allows any user/student to submit feedback
feedback_route.post('/addFeedback', feedback_controller.addFeedback);

// SECURE: Only authenticated Admins/Institutes can fetch the list of feedback
feedback_route.get('/getFeedback', requireAuth, feedback_controller.getFeedback);

// SECURE: Fetches the aggregated leaderboard data
feedback_route.get('/getLeaderboard', requireAuth, feedback_controller.getLeaderboard);

feedback_route.get('/getFeedbackByMember/:name', requireAuth, feedback_controller.getFeedbackByMember);

// SECURE: Only authenticated Admins/Institutes can delete feedback entries
feedback_route.delete('/deleteFeedback/:id', requireAuth, feedback_controller.deleteFeedback);

export default feedback_route;