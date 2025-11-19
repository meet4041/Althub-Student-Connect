const express = require("express");
const post_route = express();
const bodyParser = require("body-parser");
post_route.use(bodyParser.json());
post_route.use(bodyParser.urlencoded({ extended: true }));
const multer = require("multer");
const gridfs = require('../db/storage');

const storage = multer.memoryStorage();
const upload = multer({ storage }).array('photos', 5);

const { uploadArray } = require('../db/storage');

const uploadPic = (req, res, next) => {
    const uploadMiddleware = uploadArray('photos', 5);
    uploadMiddleware(req, res, (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).send({ success: false, message: 'File upload error: ' + err.message });
        }
        if (!req.files || req.files.length === 0) {
            req.images = [];
            return next();
        }
        try {
            req.images = req.files.map((f) => {
                const fid = f.id || f._id || (f.fileId && f.fileId.toString());
                return `/api/images/${fid}`;
            });
            return next();
        } catch (e) {
            console.error('Error mapping uploaded files', e.message);
            return res.status(500).send({ success: false, msg: e.message });
        }
    });
};

const post_controller = require("../controllers/postController");

//event routes
post_route.post('/addPost', uploadPic, post_controller.addPost);
post_route.get('/getPost', post_controller.getPosts);
post_route.delete('/deletePost/:id', post_controller.deletePost);
post_route.post('/editPost', uploadPic, post_controller.editPost);
post_route.put('/like/:id', post_controller.likeUnlikePost);
post_route.get('/getFriendsPost/all', post_controller.getFriendsPost);
post_route.get('/getPostById/:userid', post_controller.getPostById);
post_route.post('/instituteAddPost', uploadPic, post_controller.instituteAddPost);

module.exports = post_route;