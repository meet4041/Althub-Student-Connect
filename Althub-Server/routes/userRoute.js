const express = require("express");
const user_route = express();
const bodyParser = require("body-parser");
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));
const { uploadSingle } = require('../db/storage');
const user_controller = require("../controllers/userController");

// --- OLD ROUTE (Kept for compatibility) ---
user_route.post('/uploadUserImage', uploadSingle('profilepic'), (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ success: false, msg: 'No file provided' });
        const fileId = req.file.id || req.file._id || (req.file.fileId && req.file.fileId.toString());
        const url = `/api/images/${fileId}`;
        return res.status(200).send({ success: true, data: { url } });
    } catch (err) {
        console.error('Error in uploadUserImage route', err.message);
        return res.status(500).send({ success: false, msg: err.message });
    }
});

// --- NEW CRUD ROUTES for PROFILE IMAGE ---
// 1. Update: Expects form-data with key 'image' and 'userid'
user_route.put('/updateProfilePic', uploadSingle('image'), user_controller.updateProfilePic);

// 2. Delete: Expects user ID in the URL
user_route.put('/deleteProfilePic/:id', user_controller.deleteProfilePic);


// --- EXISTING ROUTES ---
user_route.post('/register', user_controller.registerUser);
user_route.post('/userLogin', user_controller.userlogin);
user_route.post('/userUpdatePassword', user_controller.updatePassword);
user_route.post('/userForgetPassword', user_controller.forgetPassword);
user_route.post('/userResetPassword', user_controller.resetpassword);
user_route.post('/userProfileEdit', user_controller.userProfileEdit);
user_route.post('/searchUser', user_controller.searchUser);
user_route.post('/getTopUsers', user_controller.getTopUsers);
user_route.get('/searchUserById/:_id', user_controller.searchUserById);
user_route.get('/userLogout', user_controller.userLogout);
user_route.get('/getUsers', user_controller.getUsers);
user_route.get('/getUsersOfInstitute/:institute', user_controller.getUsersOfInstitute);
user_route.put("/follow/:id", user_controller.followUser);
user_route.put("/unfollow/:id", user_controller.unfollowUser);
user_route.delete("/deleteUser/:id", user_controller.deleteUser);

module.exports = user_route;