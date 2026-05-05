import express from "express";

import { uploadArray } from "../db/conn.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import post_controller from "../controllers/postController.js";
import event_controller from "../controllers/eventController.js";
import * as user_controller from "../controllers/userController.js";
import notification_controller from "../controllers/notificationController.js";

const router = express.Router();

const copyParamToBody = (paramName, bodyName = "id") => (req, res, next) => {
  req.body = { ...req.body, [bodyName]: req.params[paramName] };
  next();
};

const copyParam = (from, to) => (req, res, next) => {
  req.params[to] = req.params[from];
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

export default router;
