import express from "express";
const post_route = express.Router();

import { uploadArray } from '../db/conn.js';
import post_controller from "../controllers/postController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

<<<<<<< HEAD
// Add Post: Handles up to 5 photos with key 'photos'
post_route.post('/addPost', requireAuth, uploadArray('photos', 5), post_controller.addPost);

// Edit Post: Handles up to 5 photos with key 'photos'
post_route.post('/editPost', requireAuth, uploadArray('photos', 5), post_controller.editPost);
=======
// FIX: Added 'uploadArray' to the import list so it is defined
const { uploadSingle, uploadFromBuffer, uploadArray } = require('../db/storage'); 
const post_controller = require("../controllers/postController");
const { requireAuth } = require("../middleware/authMiddleware");

// 2. MIDDLEWARE: Handle File Upload & Save to GridFS (Optional if not used in routes directly)
const uploadPic = (req, res, next) => {
    const uploadMiddleware = uploadSingle('image'); 
    
    uploadMiddleware(req, res, async (err) => {
        if (err) {
            return res.status(400).send({ success: false, message: 'Upload error: ' + err.message });
        }
        
        if (req.file) {
            try {
                const fid = await uploadFromBuffer(
                    req.file.buffer, 
                    req.file.originalname, 
                    req.file.mimetype
                );
                const imageUrl = `/api/images/${fid}`;
                req.body.image = imageUrl; 
                req.images = [imageUrl]; 
            } catch (uploadError) {
                console.error("GridFS Upload Error:", uploadError);
                return res.status(500).send({ success: false, message: 'Image saving failed' });
            }
        }
        next();
    });
};

// --- ROUTES ---

// Add Post
// Posts: allow up to 5 files, 20MB per file
post_route.post('/addPost', requireAuth, uploadArray('photos', 5, { maxFileSize: 20 * 1024 * 1024 }), post_controller.addPost);

// Edit Post
post_route.post('/editPost', requireAuth, uploadArray('photos', 5, { maxFileSize: 20 * 1024 * 1024 }), post_controller.editPost);
>>>>>>> a268263 (ok)

// Delete Post
post_route.delete('/deletePost/:id', requireAuth, post_controller.deletePost);

// Like Post
post_route.put('/like/:id', requireAuth, post_controller.likeUnlikePost);

// Get Posts
post_route.get('/getPost', requireAuth, post_controller.getPosts);
post_route.get('/getFriendsPost/all', requireAuth, post_controller.getFriendsPost);
post_route.get('/getPostById/:userid', requireAuth, post_controller.getPostById);
// Alias for legacy frontend route name
post_route.get('/getPostByUser/:userid', requireAuth, post_controller.getPostById);

<<<<<<< HEAD
// Institute Specific Add Post (Using same upload middleware)
post_route.post('/instituteAddPost', requireAuth, uploadArray('photos', 5), post_controller.instituteAddPost);
=======
// Institute Specific Add Post
post_route.post('/instituteAddPost', requireAuth, uploadArray('photos', 5, { maxFileSize: 20 * 1024 * 1024 }), post_controller.instituteAddPost);
>>>>>>> a268263 (ok)

export default post_route;