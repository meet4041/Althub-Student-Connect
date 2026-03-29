import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import feedback_controller from "../controllers/feedbackController.js";

const feedback_route = express.Router();

<<<<<<< HEAD
// Middleware setup
feedback_route.use(bodyParser.json());
feedback_route.use(bodyParser.urlencoded({ extended: true }));
feedback_route.use(cookieParser());
=======
>>>>>>> c94aaa1 (althub main v2)
/**
 * FEEDBACK ROUTES
 */

<<<<<<< HEAD
// PUBLIC: Allows any user/student to submit feedback
feedback_route.post('/addFeedback', feedback_controller.addFeedback);
=======
// --- PROTECTED ROUTES ---
// Requires authentication to submit feedback
feedback_route.post('/addFeedback', requireAuth, feedback_controller.addFeedback);
>>>>>>> c94aaa1 (althub main v2)

// SECURE: Only authenticated Admins/Institutes can fetch the list of feedback
feedback_route.get('/getFeedback', requireAuth, feedback_controller.getFeedback);

// SECURE: Only authenticated Admins/Institutes can delete feedback entries
feedback_route.delete('/deleteFeedback/:id', requireAuth, feedback_controller.deleteFeedback);

export default feedback_route;