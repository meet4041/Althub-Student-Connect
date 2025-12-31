const express = require("express");
const user_route = express.Router();
const { uploadSingle } = require('../db/storage');
const user_controller = require("../controllers/userController");
const { requireAuth } = require("../middleware/authMiddleware");

// --- PUBLIC ROUTES ---
user_route.post('/register', user_controller.registerUser);
user_route.post('/userLogin', user_controller.userlogin);
user_route.post('/userForgetPassword', user_controller.forgetPassword);
user_route.post('/userResetPassword', user_controller.resetpassword);
user_route.get('/userLogout', user_controller.userLogout);

// --- PROTECTED ROUTES ---
user_route.post('/updatePassword', requireAuth, user_controller.updatePassword);
user_route.post('/userProfileEdit', requireAuth, user_controller.userProfileEdit);
user_route.put('/deleteProfilePic/:id', requireAuth, user_controller.deleteProfilePic);
user_route.delete("/deleteUser/:id", requireAuth, user_controller.deleteUser);
user_route.put('/updateProfilePic', requireAuth, uploadSingle('image'), user_controller.updateProfilePic);

// Image Uploads
user_route.post('/uploadUserImage', requireAuth, uploadSingle('profilepic'), (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ success: false, msg: 'No file provided' });
        const fileId = req.file.id || req.file._id || (req.file.fileId && req.file.fileId.toString());
        return res.status(200).send({ success: true, data: { url: `/api/images/${fileId}` } });
    } catch (err) {
        res.status(500).send({ success: false, msg: err.message });
    }
});

// User Data & Search
user_route.get('/getUsers', requireAuth, user_controller.getUsers);
user_route.post('/getRandomUsers', requireAuth, user_controller.getRandomUsers);
user_route.post('/searchUser', requireAuth, user_controller.searchUser);
user_route.post('/getTopUsers', requireAuth, user_controller.getTopUsers);
user_route.get('/searchUserById/:_id', requireAuth, user_controller.searchUserById);
//user_route.get('/searchFollowings/:userId/:query', user_controller.searchFollowings);
user_route.get('/getUsersOfInstitute/:institute', requireAuth, user_controller.getUsersOfInstitute);

// Social Actions
user_route.put("/follow/:id", requireAuth, user_controller.followUser);
user_route.put("/unfollow/:id", requireAuth, user_controller.unfollowUser);

module.exports = user_route;