const Post = require("../models/postModel");
const User = require("../models/userModel");
const Institute = require("../models/instituteModel");
const Notification = require("../models/notificationModel");
const { uploadFromBuffer, connectToMongo } = require("../db/conn");

// --- 1. ADD POST ---
const addPost = async (req, res) => {
    try {

        let photos = [];
        if (req.body.image) {
            photos = [req.body.image];
        } else if (req.images) {
            photos = req.images; // Fallback for backward compatibility
        }

        const post = new Post({
            userid: req.body.userid,
            fname: req.body.fname,
            lname: req.body.lname,
            companyname: req.body.companyname,
            profilepic: req.body.profilepic,
            description: req.body.description,
            date: req.body.date || new Date(),
            photos: photos, // <--- Assign the fixed array here
        });

        const savedPost = await newPost.save();

        res.status(200).send({ success: true, msg: "Post Added Successfully", data: savedPost });

    } catch (error) {
        console.error("Add Post Error:", error);
        res.status(400).send({ success: false, msg: error.message });
    }
};

// --- 2. GET POST BY ID (MATCHING FIX) ---
const getPostById = async (req, res) => {
    try {
        // We search by 'userid' because that is what we are now saving in addPost
        // We also use $or to find old posts that might only have 'senderid'
        const id = req.params.userid;
        
        const post_data = await Post.find({ 
            $or: [
                { userid: id }, 
                { senderid: id }
            ] 
        }).sort({ date: -1 }).lean();
        
        res.status(200).send({ success: true, data: post_data });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

// --- 3. EDIT POST ---
const editPost = async (req, res) => {
    try {
        // FIX: Handle the single image string for institutes as well
        let photos = [];
        if (req.body.image) {
            photos = [req.body.image];
        } else if (req.images) {
            photos = req.images;
        }

        const post = new Post({
            userid: req.body.userid,
            fname: req.body.fname,
            profilepic: req.body.profilepic,
            description: req.body.description,
            photos: photos, // <--- Assign the fixed array here
            date: new Date()
        });

        const updatedPhotos = [...(post.photos || []), ...newPhotoUrls];

        const updateData = {
            title,
            description,
            photos: updatedPhotos
        };

        const updatedPost = await Post.findByIdAndUpdate(
            id, 
            { $set: updateData }, 
            { new: true }
        );

        res.status(200).send({ success: true, msg: "Post Updated", data: updatedPost });

    } catch (error) {
        console.error("Edit Post Error:", error);
        res.status(400).send({ success: false, msg: error.message });
    }
};

// --- OTHER FUNCTIONS (Keep as they are) ---

const getPosts = async (req, res) => {
    try {
        const post_data = await Post.find({}).sort({ date: -1 }).limit(20).lean();
        res.status(200).send({ success: true, data: post_data });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const deletePost = async (req, res) => {
    try {
        const id = req.params.id;
        await Post.deleteOne({ _id: id });
        res.status(200).send({ success: true, msg: 'Post Deleted successfully' });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const editPost = async (req, res) => {
    try {
        const id = req.body.id;
        const updateData = {};

        if (req.body.description !== undefined) {
            updateData.description = req.body.description;
        }

        // FIX: Logic to handle new single image + existing images
        let photos = [];

        // 1. Add existing photos (that the user didn't delete)
        if (req.body.existingPhotos) {
            let existing = req.body.existingPhotos;
            // Ensure it is an array (if only 1 photo exists, it might come as a string)
            if (!Array.isArray(existing)) {
                existing = [existing];
            }
            photos = [...existing];
        }

        // 2. Add NEW uploaded image (from req.body.image set by uploadSingle middleware)
        if (req.body.image) {
            photos.push(req.body.image);
        }
        // 3. Fallback for multiple images (if logic changes back to uploadArray)
        else if (req.images && req.images.length > 0) {
            photos = [...photos, ...req.images];
        }

        // Only update photos if we have a valid array or if user explicitly cleared them
        if (photos.length > 0) {
             updateData.photos = photos;
        } else if (req.body.photos === '[]' || (Array.isArray(req.body.photos) && req.body.photos.length === 0)) {
             updateData.photos = [];
        }

        if (req.body.likes) updateData.likes = req.body.likes;
        if (req.body.comments) updateData.comments = req.body.comments;

        const post_data = await Post.findByIdAndUpdate(
            { _id: id },
            { $set: updateData },
            { new: true }
        );

        res.status(200).send({ success: true, msg: 'Post Updated Successfully', data: post_data });

    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const likeUnlikePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId } });
            
            // Notification logic
            try {
                const liker = await User.findById(req.body.userId);
                if (liker && post.userid !== req.body.userId) { 
                    const notification = new Notification({
                        userid: post.userid || post.senderid, // Handle both
                        senderid: req.body.userId,
                        image: liker.profilepic,
                        title: "New Like",
                        msg: `${liker.fname} ${liker.lname} liked your photo.`,
                        date: new Date()
                    });
                    await notification.save();
                }
            } catch (notifyErr) {
                console.log("Notification error (non-fatal):", notifyErr.message);
            }

            res.status(200).send({ msg: "Like" });
        } else {
            await post.updateOne({ $pull: { likes: req.body.userId } });
            res.status(200).send({ msg: "disliked" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getFriendsPost = async (req, res) => {
    try {
        const currentUser = await User.findById(req.body.userId).lean();
        if (!currentUser) return res.status(404).json("User not found");

        const userPosts = await Post.find({ userid: currentUser._id }).lean();
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId) => {
                return Post.find({ userid: friendId }).lean();
            })
        );
        const allPosts = userPosts.concat(...friendPosts);
        allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.status(200).json(allPosts);
    } catch (err) {
        res.status(500).json(err);
    }
};

const instituteAddPost = async (req, res) => {
    return addPost(req, res);
}

module.exports = {
    addPost,
    getPosts,
    deletePost,
    editPost,
    likeUnlikePost,
    getFriendsPost,
    getPostById,
    instituteAddPost
}