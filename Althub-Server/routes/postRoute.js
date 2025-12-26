const express = require("express");
const post_route = express.Router();
const { uploadArray } = require('../db/storage'); 
const post_controller = require("../controllers/postController");
const { requireAuth } = require("../middleware/authMiddleware");

// 2. MIDDLEWARE: This "unlocks" the FormData. 
// It handles files if they exist, and parses text fields (like userid, description) into req.body
const uploadPic = (req, res, next) => {
    // 'photos' matches the field name used in your Frontend: body.append(`photos`, ...)
    const uploadMiddleware = uploadArray('photos', 5);
    
    uploadMiddleware(req, res, (err) => {
        if (err) {
            return res.status(400).send({ success: false, message: 'Upload error: ' + err.message });
        }
        
        // Map uploaded files to a URL structure the frontend can use
        req.images = (req.files || []).map((f) => {
            const fid = f.id || f._id || (f.fileId && f.fileId.toString());
            return `/api/images/${fid}?mime=${f.mimetype}`; // Matches your streamToResponse logic
        });
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

// 5. FIX: Apply to institute posts
post_route.post('/instituteAddPost', requireAuth, uploadPic, post_controller.instituteAddPost);

module.exports = post_route;