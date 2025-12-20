const express = require("express");
const post_route = express.Router(); // FIX: Use Router
const { uploadArray } = require('../db/storage');
const post_controller = require("../controllers/postController");

const uploadPic = (req, res, next) => {
    const uploadMiddleware = uploadArray('photos', 5);
    uploadMiddleware(req, res, (err) => {
        if (err) return res.status(400).send({ success: false, message: 'Upload error: ' + err.message });
        
        req.images = (req.files || []).map((f) => {
            const fid = f.id || f._id || (f.fileId && f.fileId.toString());
            return `/api/images/${fid}?mime=${f.mimetype}`;
        });
        next();
    });
};

post_route.post('/addPost', uploadPic, post_controller.addPost);
post_route.get('/getPost', post_controller.getPosts);
post_route.delete('/deletePost/:id', post_controller.deletePost);
post_route.post('/editPost', uploadPic, post_controller.editPost);
post_route.put('/like/:id', post_controller.likeUnlikePost);
post_route.get('/getFriendsPost/all', post_controller.getFriendsPost);
// This route is called by Dashboard.
post_route.get('/getPostById/:userid', post_controller.getPostById);
post_route.post('/instituteAddPost', uploadPic, post_controller.instituteAddPost);

module.exports = post_route;