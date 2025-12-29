const express = require("express");
const post_route = express.Router();
// 1. IMPORT FIX: Import 'uploadSingle' instead of 'uploadArray'
const { uploadSingle } = require('../db/storage'); 
const post_controller = require("../controllers/postController");
const { requireAuth } = require("../middleware/authMiddleware");

// 2. MIDDLEWARE: The Bridge between Frontend and Database
const uploadPic = (req, res, next) => {
    // FIX: Field name changed from 'photos' to 'image' to match frontend FormData
    const uploadMiddleware = uploadSingle('image'); 
    
    uploadMiddleware(req, res, (err) => {
        if (err) {
            return res.status(400).send({ success: false, message: 'Upload error: ' + err.message });
        }
        
        // FIX: Handle the single file object (req.file)
        if (req.file) {
            // Get the GridFS ID
            const fid = req.file.id || req.file._id || (req.file.fileId && req.file.fileId.toString());
            
            // Create the URL
            const imageUrl = `/api/images/${fid}`;
            
            // CRITICAL: Add the URL to req.body.image
            // This ensures postController can see it and save it to MongoDB
            req.body.image = imageUrl; 
        }
        
        next();
    });
};

// --- ROUTES ---

post_route.post('/addPost', requireAuth, uploadPic, post_controller.addPost);
post_route.get('/getPost', requireAuth, post_controller.getPosts);
post_route.delete('/deletePost/:id', requireAuth, post_controller.deletePost);
post_route.post('/editPost', requireAuth, uploadPic, post_controller.editPost);
post_route.put('/like/:id', requireAuth, post_controller.likeUnlikePost);
post_route.get('/getFriendsPost/all', requireAuth, post_controller.getFriendsPost);
post_route.get('/getPostById/:userid', requireAuth, post_controller.getPostById);

// Institute Route
post_route.post('/instituteAddPost', requireAuth, uploadPic, post_controller.instituteAddPost);

module.exports = post_route;