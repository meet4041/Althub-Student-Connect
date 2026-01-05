import express from "express";
const post_route = express.Router();

import { uploadArray } from '../db/conn.js';
import post_controller from "../controllers/postController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

// Add Post: Handles up to 5 photos with key 'photos'
post_route.post('/addPost', requireAuth, uploadArray('photos', 5), post_controller.addPost);

// Edit Post: Handles up to 5 photos with key 'photos'
post_route.post('/editPost', requireAuth, uploadArray('photos', 5), post_controller.editPost);

// Delete Post
post_route.delete('/deletePost/:id', requireAuth, post_controller.deletePost);

// Like Post
post_route.put('/like/:id', requireAuth, post_controller.likeUnlikePost);

// Get Posts
post_route.get('/getPost', requireAuth, post_controller.getPosts);
post_route.get('/getFriendsPost/all', requireAuth, post_controller.getFriendsPost);
post_route.get('/getPostById/:userid', requireAuth, post_controller.getPostById);

// Institute Specific Add Post (Using same upload middleware)
post_route.post('/instituteAddPost', requireAuth, uploadArray('photos', 5), post_controller.instituteAddPost);

export default post_route;