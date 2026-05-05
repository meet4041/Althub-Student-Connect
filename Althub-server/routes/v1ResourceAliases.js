import express from "express";

import { uploadArray, uploadSingle } from "../db/conn.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import post_controller from "../controllers/postController.js";
import event_controller from "../controllers/eventController.js";
import * as user_controller from "../controllers/userController.js";
import notification_controller from "../controllers/notificationController.js";
import education_controller from "../controllers/educationController.js";
import experience_controller from "../controllers/experienceController.js";
import conversation_controller from "../controllers/conversationController.js";
import message_controller from "../controllers/messageController.js";
import feedback_controller from "../controllers/feedbackController.js";
import institute_controller from "../controllers/instituteController.js";
import course_controller from "../controllers/courseController.js";

const router = express.Router();

const copyParamToBody = (paramName, bodyName = "id") => (req, res, next) => {
  req.body = { ...req.body, [bodyName]: req.params[paramName] };
  next();
};

const copyParam = (from, to) => (req, res, next) => {
  req.params[to] = req.params[from];
  next();
};

const setBody = (values) => (req, res, next) => {
  req.body = { ...req.body, ...values(req) };
  next();
};

// Posts
router.get("/posts", requireAuth, post_controller.getPosts);
router.post("/posts", requireAuth, uploadArray("photos", 5, { maxFileSize: 20 * 1024 * 1024 }), post_controller.addPost);
router.patch("/posts/:id", requireAuth, uploadArray("photos", 5, { maxFileSize: 20 * 1024 * 1024 }), copyParamToBody("id"), post_controller.editPost);
router.delete("/posts/:id", requireAuth, post_controller.deletePost);
router.put("/posts/:id/like", requireAuth, post_controller.likeUnlikePost);
router.get("/users/:userId/posts", requireAuth, copyParam("userId", "userid"), post_controller.getPostById);
router.get("/posts/friends", requireAuth, post_controller.getFriendsPost);

// Events
router.get("/events", event_controller.getEvents);
router.post("/events", requireAuth, uploadArray("photos", 5, { maxFileSize: 10 * 1024 * 1024 }), event_controller.addEvents);
router.patch("/events/:id", requireAuth, uploadArray("photos", 5, { maxFileSize: 10 * 1024 * 1024 }), copyParamToBody("id"), event_controller.editEvent);
router.delete("/events/:id", requireAuth, event_controller.deleteEvent);
router.put("/events/:id/participation", requireAuth, event_controller.participateInEvent);
router.get("/events/upcoming", event_controller.getUpcommingEvents);
router.get("/institutes/:organizerId/events", copyParam("organizerId", "organizerid"), event_controller.getEventsByInstitute);

// Users
router.get("/users", requireAuth, user_controller.getUsers);
router.get("/users/:id", requireAuth, copyParam("id", "_id"), user_controller.searchUserById);
router.patch("/users/:id", requireAuth, copyParamToBody("id"), user_controller.userProfileEdit);
router.delete("/users/:id", requireAuth, user_controller.deleteUser);
router.put("/users/:id/profile-image", requireAuth, uploadSingle("image"), user_controller.updateProfilePic);
router.delete("/users/:id/profile-image", requireAuth, user_controller.deleteProfilePic);
router.put("/users/me/password", requireAuth, user_controller.updatePassword);
router.get("/institutes/:institute/users", requireAuth, user_controller.getUsersOfInstitute);
router.post("/users/search", requireAuth, user_controller.searchUser);
router.post("/users/random", requireAuth, user_controller.getRandomUsers);
router.put("/users/:id/follow", requireAuth, user_controller.followUser);
router.put("/users/:id/unfollow", requireAuth, user_controller.unfollowUser);

// Notifications
router.get("/users/:userid/notifications", requireAuth, (req, res, next) => {
  req.body = { ...req.body, userid: req.params.userid };
  next();
}, notification_controller.getnotifications);
router.post("/notifications", requireAuth, notification_controller.addNotification);
router.delete("/notifications/:id", requireAuth, (req, res, next) => {
  req.body = { ...req.body, notificationId: req.params.id };
  next();
}, notification_controller.deleteNotification);

// Education
router.get("/users/:userId/education", requireAuth, setBody((req) => ({ userid: req.params.userId })), education_controller.getEducation);
router.post("/users/:userId/education", requireAuth, setBody((req) => ({ userid: req.params.userId })), education_controller.addEducation);
router.patch("/education/:id", requireAuth, copyParamToBody("id"), education_controller.editEducation);
router.delete("/education/:id", requireAuth, education_controller.deleteEducation);

// Experience
router.get("/users/:userId/experience", requireAuth, setBody((req) => ({ userid: req.params.userId })), experience_controller.getExperience);
router.post("/users/:userId/experience", requireAuth, setBody((req) => ({ userid: req.params.userId })), experience_controller.addExperience);
router.patch("/experience/:id", requireAuth, setBody((req) => ({ ...req.body, _id: req.params.id })), experience_controller.editExperience);
router.delete("/experience/:id", requireAuth, experience_controller.deleteExperience);

// Conversations and messages
router.get("/users/:userId/conversations", requireAuth, conversation_controller.getConversation);
router.post("/conversations", requireAuth, conversation_controller.newConversation);
router.post("/conversations/search", requireAuth, conversation_controller.searchConversation);
router.get("/conversations/:conversationId/messages", requireAuth, message_controller.getMessages);
router.post("/messages", requireAuth, message_controller.newMessage);
router.get("/conversations/:conversationId/messages/unread/:senderId", requireAuth, message_controller.countMessages);
router.put("/conversations/:conversationId/messages/read/:senderId", requireAuth, message_controller.markMessagesRead);

// Feedback
router.post("/feedback", requireAuth, feedback_controller.addFeedback);
router.get("/feedback", requireAuth, feedback_controller.getFeedback);
router.get("/feedback/leaderboard", requireAuth, feedback_controller.getLeaderboard);
router.delete("/feedback/:id", requireAuth, feedback_controller.deleteFeedback);

// Institutes and delegated offices
router.get("/institutes", institute_controller.getInstitutes);
router.get("/institutes/:id", requireAuth, copyParam("id", "_id"), institute_controller.getInstituteById);
router.get("/institutes/:instituteId/alumni-office", requireAuth, institute_controller.getAlumniOfficeByInstitute);
router.get("/institutes/:instituteId/placement-cell", requireAuth, institute_controller.getPlacementCellByInstitute);
router.patch("/institutes/:id", requireAuth, copyParamToBody("id", "_id"), institute_controller.updateInstitute);
router.delete("/institutes/:id", requireAuth, institute_controller.deleteInstitute);

// Courses
router.get("/courses", course_controller.getCourse);
router.post("/courses", requireAuth, course_controller.addCourse);
router.patch("/courses/:id", requireAuth, copyParamToBody("id"), course_controller.editCourse);
router.delete("/courses/:id", requireAuth, course_controller.deleteCourse);
router.get("/institutes/:instituteid/courses", course_controller.getCourseByInstitute);

export default router;
