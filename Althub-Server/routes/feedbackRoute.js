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

// --- PUBLIC ROUTES ---
// Allows any registered user/student to submit feedback to a member or the institute
feedback_route.post('/addFeedback', feedback_controller.addFeedback);


// --- SECURE ROUTES (Require Institute/Admin Authentication) ---

// Fetches the full raw list of all feedback entries
feedback_route.get('/getFeedback', requireAuth, feedback_controller.getFeedback);

// Fetches aggregated leaderboard data (Total Reviews and Average Ratings per member)
feedback_route.get('/getLeaderboard', requireAuth, feedback_controller.getLeaderboard);

// Allows authorized users to remove a feedback entry
feedback_route.delete('/deleteFeedback/:id', requireAuth, feedback_controller.deleteFeedback);

export default feedback_route;