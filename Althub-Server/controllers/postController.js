const Post = require("../models/postModel");
const User = require("../models/userModel");
const Institute = require("../models/instituteModel");
const Notification = require("../models/notificationModel");

const addPost = async (req, res) => {
    try {
        const post = new Post({
            userid: req.body.userid,
            fname: req.body.fname,
            lname: req.body.lname,
            companyname: req.body.companyname,
            profilepic: req.body.profilepic,
            description: req.body.description,
            date: req.body.date || new Date(),
            // FIX: Ensure photos is an array even if req.images is undefined
            photos: req.images || [], 
        });

        const userData = await User.findOne({ _id: req.body.userid });

        if (!userData) {
            return res.status(400).send({ success: false, msg: "User not found..!" });
        } else {
            const post_data = await post.save();
            res.status(200).send({ success: true, data: post_data });
        }

    } catch (error) {
        console.error("Error in add post : " + error.message);
        res.status(400).send({ success: false, msg: error.message });
    }
}

const instituteAddPost = async (req, res) => {
    try {
        const post = new Post({
            userid: req.body.userid,
            fname: req.body.fname,
            profilepic: req.body.profilepic,
            description: req.body.description,
            // FIX: Use req.images array populated by middleware
            photos: req.images || [], 
            date: new Date()
        });

        const instituteData = await Institute.findOne({ _id: req.body.userid });

        if (!instituteData) {
            res.status(400).send({ success: false, msg: "Institute not found..!" });
        } else {
            const post_data = await post.save();
            res.status(200).send({ success: true, data: post_data });
        }

    } catch (error) {
        console.error("Error in add post (Institute): " + error.message);
        res.status(400).send({ success: false, msg: error.message });
    }
}

const getPosts = async (req, res) => {
    try {
        const post_data = await Post.find({}).sort({ date: -1 }).limit(20).lean();
        res.status(200).send({ success: true, data: post_data });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const getPostById = async (req, res) => {
    try {
        const post_data = await Post.find({ userid: req.params.userid }).sort({ date: -1 }).lean();
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

        // Logic to handle new images + existing images
        if (req.images && req.images.length > 0) {
            updateData.photos = req.images;
        } else if (req.body.existingPhotos) {
            let photosToKeep = req.body.existingPhotos;
            if (!Array.isArray(photosToKeep)) {
                photosToKeep = [photosToKeep];
            }
            updateData.photos = photosToKeep;
        } else if (req.body.photos === '[]' || (Array.isArray(req.body.photos) && req.body.photos.length === 0)){
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

            const liker = await User.findById(req.body.userId);
            
            if (liker && post.userid !== req.body.userId) { 
                const notification = new Notification({
                    userid: post.userid,
                    senderid: req.body.userId,
                    image: liker.profilepic,
                    title: "New Like",
                    msg: `${liker.fname} ${liker.lname} liked your photo.`,
                    date: new Date()
                });
                await notification.save();
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