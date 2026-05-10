import express from "express";
import { uploadSingle } from '../db/conn.js';
import * as user_controller from "../controllers/userController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import rateLimit from "express-rate-limit";

const user_route = express.Router();

const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 10,
    message: { success: false, msg: "Too many upload requests. Try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

// --- PUBLIC ROUTES ---
user_route.post('/register', user_controller.registerUser);
user_route.post('/userLogin', user_controller.userlogin);
// Refresh access token using refresh token cookie
user_route.post('/refreshToken', user_controller.refreshToken);
user_route.post('/userForgetPassword', user_controller.forgetPassword);
user_route.post('/userResetPassword', user_controller.resetpassword);
user_route.get('/userLogout', user_controller.userLogout);

// --- PROTECTED ROUTES ---
user_route.get('/auth/me', requireAuth, user_controller.getMyAuth);
user_route.post('/updatePassword', requireAuth, user_controller.updatePassword);
user_route.post('/userProfileEdit', requireAuth, user_controller.userProfileEdit);
user_route.put('/deleteProfilePic/:id', requireAuth, user_controller.deleteProfilePic);
user_route.delete("/deleteUser/:id", requireAuth, user_controller.deleteUser);
user_route.put('/updateProfilePic', requireAuth, uploadSingle('image'), user_controller.updateProfilePic);

user_route.post('/uploadUserImage', uploadLimiter, uploadSingle('profilepic'), user_controller.uploadUserImage);

// User Data & Search
user_route.get('/getUsers', requireAuth, user_controller.getUsers);
user_route.post('/getRandomUsers', requireAuth, user_controller.getRandomUsers);
user_route.post('/searchUser', requireAuth, user_controller.searchUser);
user_route.post('/getTopUsers', requireAuth, user_controller.getTopUsers);
user_route.get('/searchUserById/:_id', requireAuth, user_controller.searchUserById);
//user_route.get('/searchFollowings/:userId/:query', user_controller.searchFollowings);
user_route.get('/getUsersOfInstitute/:institute', requireAuth, user_controller.getUsersOfInstitute);
user_route.get('/getAlumniByCourseSpec', requireAuth, user_controller.getAlumniByCourseSpec);

// Social Actions
user_route.put("/follow/:id", requireAuth, user_controller.followUser);
user_route.put("/unfollow/:id", requireAuth, user_controller.unfollowUser);

export default user_route;
