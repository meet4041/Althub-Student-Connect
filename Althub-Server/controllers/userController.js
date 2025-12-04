const User = require("../models/userModel");
const bcryptjs = require("bcryptjs");
const config = require("../config/config");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const cookieParser = require("cookie-parser");

// --- HELPER: Send Email (Wrapped in Promise) ---
const sendresetpasswordMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        });

        const mailoptions = {
            from: config.emailUser,
            to: email,
            subject: 'For Reset Password',
            html: '<p>Hello ' + name + ', Please copy the link to <a href="http://localhost:3000/new-password?token=' + token + '">reset your password</a></p>'
        };

        // FIX: Wrap in Promise so we can await it in the controller
        return new Promise((resolve, reject) => {
            transporter.sendMail(mailoptions, function (error, info) {
                if (error) {
                    console.log("Error while sending email: ", error);
                    reject(error);
                }
                else {
                    console.log("Mail has been sent: ", info.response);
                    resolve(info);
                }
            });
        });

    } catch (error) {
        console.log("Nodemailer error:", error.message);
        throw error; // Re-throw to be caught by the controller
    }
}

const createtoken = async (id) => {
    try {
        const token = jwt.sign({ _id: id }, config.secret_jwt);
        return token;
    } catch (error) {
        throw new Error(error.message);
    }
}

const securePassword = async (password) => {
    try {
        const passwordhash = await bcryptjs.hash(password, 10);
        return passwordhash;
    } catch (error) {
        throw new Error(error.message);
    }
}

// --- CONTROLLERS ---

const registerUser = async (req, res) => {
    try {
        const spassword = await securePassword(req.body.password);
        const user = new User({
            fname: req.body.fname,
            lname: req.body.lname,
            gender: req.body.gender,
            dob: req.body.dob,
            city: req.body.city,
            state: req.body.state,
            nation: req.body.nation,
            profilepic: req.body.profilepic,
            phone: req.body.phone,
            email: req.body.email,
            password: spassword,
            languages: req.body.languages,
            github: req.body.github,
            linkedin: req.body.linkedin,
            portfolioweb: req.body.portfolioweb,
            skills: req.body.skills,
            institute: req.body.institute,
            role: req.body.role,
        });

        const userData = await User.findOne({ email: req.body.email });

        if (userData) {
            res.status(400).send({ success: false, msg: "User already exists" });
        }
        else {
            const token = await createtoken();
            const user_data = await user.save();
            res.status(200).send({ success: true, data: user_data, token: token });
        }

    } catch (error) {
        res.status(400).send(error.message);
        console.log("Error in Register User : " + error.message);
    }
}

const uploadUserImage = async (req, res) => {
    try {
        if (req.file !== undefined) {
            const picture = ({
                url: '/userImages/' + req.file.filename,
            });
            res.status(200).send({ success: true, data: picture });
        }
        else {
            res.status(400).send({ success: false, msg: "plz select a file" });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const userlogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });
        if (userData) {
            const passwordMatch = await bcryptjs.compare(password, userData.password);
            if (passwordMatch) {
                // Security: Don't send password back
                const { password, ...userResult } = userData._doc;
                res.status(200).send({ success: true, msg: "user details", data: userResult });
            }
            else {
                res.status(400).send({ success: false, msg: "Login details are incorrect (password incorrect)" });
            }
        } else {
            res.status(400).send({ success: false, msg: "Login details are incorrect (Register First)" });
        }

    } catch (error) {
        res.status(400).send(error.message);
        console.log("Error in Login User : " + error.message);
    }
}

const updatePassword = async (req, res) => {
    try {
        const user_id = req.body.user_id;
        var oldpassword = req.body.oldpassword;
        var newpassword = req.body.newpassword;
        const data = await User.findOne({ _id: user_id });
        if (data) {
            const passwordMatch = await bcryptjs.compare(oldpassword, data.password);
            if (passwordMatch) {
                newpassword = await securePassword(newpassword);
                const userData = await User.findByIdAndUpdate({ _id: user_id }, {
                    $set: {
                        password: newpassword
                    }
                }, { new: true });

                res.status(200).send({ success: true, msg: "Your password has been updated", data: userData });
            } else {
                res.status(400).send({ success: false, msg: "Your Old password is incorrect" });
            }
        }
        else {
            res.status(400).send({ success: false, msg: "User Id not found!" });
        }

    } catch (error) {
        res.status(400).send(error.message);
    }
}

const forgetPassword = async (req, res) => {
    try {
        const email = req.body.email;
        const userData = await User.findOne({ email: email });
        
        if (userData) {
            const randomString = randomstring.generate();
            
            // 1. Update token in DB
            await User.updateOne({ email: email }, {
                $set: {
                    token: randomString
                }
            });

            // 2. FIX: Await the email sending. If this fails, we go to catch()
            await sendresetpasswordMail(userData.fname, userData.email, randomString);
            
            // 3. Send success ONLY if email actually sent
            res.status(200).send({ success: true, msg: "Please Check your inbox of mail and reset your password" });
        }
        else {
            res.status(200).send({ success: false, msg: "This Email does not exist!" });
        }
    } catch (error) {
        console.error("Forget Password Error:", error);
        res.status(500).send({ success: false, msg: "Failed to send reset email. Please check server logs." });
    }
}

const resetpassword = async (req, res) => {
    try {
        const token = req.query.token;
        const tokenData = await User.findOne({ token: token });
        if (tokenData) {
            const password = req.body.password;
            const newpassword = await securePassword(password);
            const userData = await User.findByIdAndUpdate({ _id: tokenData._id }, {
                $set: {
                    password: newpassword,
                    token: '' // Clear token so it can't be reused
                }
            }, { new: true });

            res.status(200).send({ success: true, msg: "User password has been reset!", data: userData });
        }
        else {
            res.status(200).send({ success: false, msg: "This link has expired or is invalid!" });
        }
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const userProfileEdit = async (req, res) => {
    try {
        var id = req.body.id;
        var fname = req.body.fname;
        var lname = req.body.lname;
        var gender = req.body.gender;
        var dob = req.body.dob;
        var city = req.body.city;
        var state = req.body.state;
        var nation = req.body.nation;
        // Profilepic is handled by updateProfilePic
        var phone = req.body.phone;
        var email = req.body.email;
        var languages = req.body.languages;
        var github = req.body.github;
        var linkedin = req.body.linkedin;
        var portfolioweb = req.body.portfolioweb;
        var skills = req.body.skills;
        var institute = req.body.institute;
        var role = req.body.role
        var about = req.body.about
        
        const new_data = await User.findByIdAndUpdate({ _id: id }, { $set: { fname: fname, lname: lname, gender: gender, dob: dob, city: city, state: state, nation: nation, phone: phone, email: email, languages: languages, github: github, linkedin: linkedin, portfolioweb: portfolioweb, skills: skills, role: role, institute: institute, about: about } }, { new: true });

        res.status(200).send({ success: true, msg: 'User Profile Updated', data: new_data });
    }
    catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await User.deleteOne({ _id: id });
        res.status(200).send({ success: true, msg: 'user Deleted successfully' });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const searchUser = async (req, res) => {
    try {
        var search = req.body.search;
        var user_data = await User.find({
            $or: [
                { "fname": { $regex: new RegExp(".*" + search + ".*", "i") } },
                { "lname": { $regex: new RegExp(".*" + search + ".*", "i") } }
            ]
        });;
        if (user_data.length > 0) {
            res.status(200).send({ success: true, msg: "User Details", data: user_data });
        }
        else {
            res.status(200).send({ success: true, msg: 'No User Found' });
        }

    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const searchUserById = async (req, res) => {
    try {
        const id = req.params._id;
        if (!id) return res.status(400).send({ success: false, msg: 'Missing user id' });
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ success: false, msg: 'Invalid user id' });
        }
        const user = await User.find({ _id: id });
        return res.status(200).send({ success: true, data: user });
    } catch (error) {
        console.error('Error in searchUserById:', error.message);
        res.status(500).send({ success: false, msg: error.message });
    }
}

const userLogout = async (req, res) => {
    try {
        res.clearCookie("jwt_token");
        res.status(200).send({ success: true, msg: "successfully Loged Out" });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const getUsers = async (req, res) => {
    try {
        const user_data = await User.find({});
        res.status(200).send({ success: true, data: user_data });
    }
    catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const getTopUsers = async (req, res) => {
    try {
        const user_data = await User.find({ institute: req.body.institute }).limit(5);
        res.status(200).send({ success: true, data: user_data });
    }
    catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const getUsersOfInstitute = async (req, res) => {
    try {
        const user_data = await User.find({ institute: req.params.institute });
        res.status(200).send({ success: true, data: user_data });
    }
    catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const followUser = async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if (!user.followers.includes(req.body.userId)) {
                await user.updateOne({ $push: { followers: req.body.userId } });
                await currentUser.updateOne({ $push: { followings: req.params.id } });
                res.status(200).json("user has been followed");
            } else {
                res.status(403).json("you allready follow this user");
            }
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("you cant follow yourself");
    }
};

const unfollowUser = async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if (user.followers.includes(req.body.userId)) {
                await user.updateOne({ $pull: { followers: req.body.userId } });
                await currentUser.updateOne({ $pull: { followings: req.params.id } });
                res.status(200).json("user has been unfollowed");
            } else {
                res.status(403).json("you dont unfollow this user");
            }
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("you cant unfollow yourself");
    }
};

// --- CRUD for Profile Picture ---
const updateProfilePic = async (req, res) => {
    try {
        const userId = req.body.userid;
        if (!userId) {
            return res.status(400).send({ success: false, msg: "User ID is required" });
        }
        if (!req.file) {
            return res.status(400).send({ success: false, msg: "No image provided" });
        }

        const fileId = req.file.id || req.file._id || (req.file.fileId && req.file.fileId.toString());
        const imageUrl = `/api/images/${fileId}`;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { profilepic: imageUrl } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).send({ success: false, msg: "User not found" });
        }

        res.status(200).send({ success: true, msg: "Profile picture updated", data: updatedUser });

    } catch (error) {
        console.error("Error updating profile pic:", error);
        res.status(500).send({ success: false, msg: error.message });
    }
};

const deleteProfilePic = async (req, res) => {
    try {
        const userId = req.params.id;
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { profilepic: "" } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).send({ success: false, msg: "User not found" });
        }

        res.status(200).send({ success: true, msg: "Profile picture removed", data: updatedUser });

    } catch (error) {
        console.error("Error deleting profile pic:", error);
        res.status(500).send({ success: false, msg: error.message });
    }
};

module.exports = {
    registerUser,
    userlogin,
    updatePassword,
    forgetPassword,
    resetpassword,
    userProfileEdit,
    searchUser,
    userLogout,
    uploadUserImage,
    getUsers,
    followUser,
    unfollowUser,
    searchUserById,
    deleteUser,
    getUsersOfInstitute,
    getTopUsers,
    updateProfilePic,
    deleteProfilePic
}