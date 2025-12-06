const User = require("../models/userModel");
const Education = require("../models/educationModel"); // Ensure this is imported
const bcryptjs = require("bcryptjs");
const config = require("../config/config");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const cookieParser = require("cookie-parser");
const mongoose = require('mongoose');

// ... (Keep existing helper functions: sendresetpasswordMail, createtoken, securePassword)

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
        throw error;
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

// --- HELPER: Alumni Check Logic ---
const checkAlumniStatus = (educations) => {
    if (!educations || educations.length === 0) return false;

    // 1. If currently studying (no end date), not alumni
    const isStudying = educations.some(edu => !edu.enddate || edu.enddate === "");
    if (isStudying) return false;

    // 2. Find latest graduation year
    let maxYear = 0;
    educations.forEach(edu => {
        const d = new Date(edu.enddate);
        if (!isNaN(d.getTime()) && d.getFullYear() > maxYear) {
            maxYear = d.getFullYear();
        }
    });

    // 3. Check if past May 15th of max year
    const cutoffDate = new Date(maxYear, 4, 15); // Month 4 is May
    const now = new Date();

    return now > cutoffDate;
};

// ... (Keep existing controllers: registerUser, userlogin, updatePassword, etc.)

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
            await User.updateOne({ email: email }, { $set: { token: randomString } });
            await sendresetpasswordMail(userData.fname, userData.email, randomString);
            res.status(200).send({ success: true, msg: "Please Check your inbox of mail and reset your password" });
        }
        else {
            res.status(200).send({ success: false, msg: "This Email does not exist!" });
        }
    } catch (error) {
        console.error("Forget Password Error:", error);
        res.status(500).send({ success: false, msg: "Failed to send reset email." });
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
                $set: { password: newpassword, token: '' }
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
        const updateFields = {
            fname: req.body.fname, lname: req.body.lname, gender: req.body.gender,
            dob: req.body.dob, city: req.body.city, state: req.body.state,
            nation: req.body.nation, phone: req.body.phone, email: req.body.email,
            languages: req.body.languages, github: req.body.github,
            portfolioweb: req.body.portfolioweb,
            skills: req.body.skills, institute: req.body.institute,
            role: req.body.role, about: req.body.about
        };

        const new_data = await User.findByIdAndUpdate({ _id: id }, { $set: updateFields }, { new: true });
        res.status(200).send({ success: true, msg: 'User Profile Updated', data: new_data });
    }
    catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        await User.deleteOne({ _id: id });
        res.status(200).send({ success: true, msg: 'user Deleted successfully' });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

// --- UPDATED SEARCH USER (Fixing Alumni Check) ---
const searchUser = async (req, res) => {
    try {
        const search = req.body.search || "";
        const regex = new RegExp(search, "i"); // Simple regex, no .* wrapper needed

        // Use Aggregation to fetch User + Education in ONE query
        const user_data = await User.aggregate([
            {
                // 1. Filter Users first (Index usage if available)
                $match: {
                    $or: [
                        { fname: { $regex: regex } },
                        { lname: { $regex: regex } }
                    ]
                }
            },
            {
                // 2. Limit results early to reduce processing load
                $limit: 20 
            },
            {
                // 3. Lookup Education data (Join)
                $lookup: {
                    from: "educations", // Ensure this matches your Education collection name in MongoDB (usually lowercase plural)
                    let: { userId: "$_id" },
                    pipeline: [
                        { 
                            $match: { 
                                $expr: { 
                                    // Match education.userid (string) with user._id (ObjectId)
                                    // We convert ObjectId to string for comparison
                                    $eq: ["$userid", { $toString: "$$userId" }] 
                                } 
                            }
                        },
                        { $project: { enddate: 1 } } // Only fetch enddate needed for logic
                    ],
                    as: "educationList"
                }
            },
            {
                // 4. Project only necessary fields + Calculate isAlumni
                $project: {
                    fname: 1,
                    lname: 1,
                    profilepic: 1,
                    city: 1,
                    state: 1,
                    followers: 1,
                    github: 1,
                    skills: 1,
                    // Determine Alumni Status directly in projection if possible, 
                    // or pass educationList to frontend. 
                    // For perfect accuracy with your specific JS logic, we can keep the JS map but now it's in-memory, not DB queries.
                    educationList: 1 
                }
            }
        ]);

        // 5. Lightweight In-Memory Calculation (No extra DB calls)
        const finalData = user_data.map(user => {
            const isAlumni = checkAlumniStatus(user.educationList);
            // Remove the heavy education list from response
            delete user.educationList; 
            return { ...user, isAlumni };
        });

        if (finalData.length > 0) {
            res.status(200).send({ success: true, msg: "User Details", data: finalData });
        } else {
            res.status(200).send({ success: true, msg: 'No User Found' });
        }

    } catch (error) {
        console.error("Search Error:", error);
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
        // --- OPTIMIZATION: .lean() ---
        const user = await User.find({ _id: id }).lean();
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
        // --- OPTIMIZATION: .lean() ---
        const user_data = await User.find({}).lean();
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
        // --- OPTIMIZATION: .lean() ---
        const user_data = await User.find({ institute: req.params.institute }).lean();
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

const getRandomUsers = async (req, res) => {
    try {
        const currentUserId = req.body.userid;
        let excludedIds = [];

        // 1. If valid User ID, fetch the user to get their 'followings' list
        if (currentUserId && mongoose.Types.ObjectId.isValid(currentUserId)) {
            const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);

            // Add self to exclusion
            excludedIds.push(currentUserObjectId);

            // Fetch user to get followings
            const currentUser = await User.findById(currentUserId);
            if (currentUser && currentUser.followings && currentUser.followings.length > 0) {
                // Add all followed IDs to exclusion (Convert to ObjectId if stored as strings)
                const followingIds = currentUser.followings.map(id => new mongoose.Types.ObjectId(id));
                excludedIds = excludedIds.concat(followingIds);
            }
        }

        const pipeline = [];

        // 2. Filter: Exclude Self AND Following
        if (excludedIds.length > 0) {
            pipeline.push({
                $match: { _id: { $nin: excludedIds } }
            });
        }

        // 3. Randomly select 4 users
        pipeline.push({ $sample: { size: 4 } });

        // 4. Project only necessary fields
        pipeline.push({
            $project: {
                fname: 1,
                lname: 1,
                profilepic: 1,
                city: 1,
                state: 1,
                nation: 1,
                institute: 1,
                followers: 1,
                followings: 1
            }
        });

        const user_data = await User.aggregate(pipeline);

        res.status(200).send({ success: true, data: user_data });

    } catch (error) {
        console.error("Random Users Error:", error);
        res.status(400).send({ success: false, msg: error.message });
    }
}

// ... (Keep existing functions: registerUser, userlogin, etc.)

// 3. UPDATE EXPORTS AT THE BOTTOM
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
    deleteProfilePic,
    getRandomUsers // <--- Don't forget to add this!
}