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
            date: req.body.date,
            photos: req.images,
        });
        const userData = await User.findOne({ _id: req.body.userid });

        if (!userData) {
            return res.status(400).send({ success: false, msg: "User not found..!" });
        }
        else {
            const post_data = await post.save();
            res.status(200).send({ success: true, data: post_data });
        }

    } catch (error) {
        res.status(400).send(error.message);
        console.log("Error in add post : " + error.message);
    }
}

const instituteAddPost = async (req, res) => {
    try {
        const post = new Post({
            userid: req.body.userid,
            fname: req.body.fname,
            profilepic: req.body.profilepic,
            description: req.body.description,
            photos: req.images,
            date: new Date() // Ensure date is set
        });
        const instituteData = await Institute.findOne({ _id: req.body.userid });

        if (!instituteData || instituteData._id == '') {
            res.status(400).send({ success: false, msg: "institute not found..!" });
        }
        else {
            const post_data = await post.save();
            res.status(200).send({ success: true, data: post_data });
        }

    } catch (error) {
        res.status(400).send(error.message);
        console.log("Error in add post (Institute): " + error.message);
    }
}

const getPosts = async (req, res) => {
    try {
        // Sort by date Descending (-1) so newest is first
        const post_data = await Post.find({}).sort({ date: -1 }).limit(20);
        res.status(200).send({ success: true, data: post_data });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const getPostById = async (req, res) => {
    try {
        // Sort by date Descending here as well
        const post_data = await Post.find({ userid: req.params.userid }).sort({ date: -1 });
        res.status(200).send({ success: true, data: post_data });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const deletePost = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Post.deleteOne({ _id: id });
        res.status(200).send({ success: true, msg: 'Post Deleted successfully' });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const editPost = async (req, res) => {
    try {
        if (req.images && req.images.length > 0) {
            var id = req.body.id;
            var likes = req.body.likes;
            var comments = req.body.comments;
            var photos = req.images

            const post_data = await Post.findByIdAndUpdate({ _id: id }, { $set: { likes: likes, comments: comments, photos: photos } }, { new: true });
            res.status(200).send({ success: true, msg: 'Post Updated', data: post_data });
        }
        else {
            var id = req.body.id;
            var likes = req.body.likes;
            var comments = req.body.comments;

            const post_data = await Post.findByIdAndUpdate({ _id: id }, { $set: { likes: likes, comments: comments } }, { new: true });
            res.status(200).send({ success: true, msg: 'Post Updated', data: post_data });
        }
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const likeUnlikePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId } });

            // --- NEW: Create Notification for Like ---
            const liker = await User.findById(req.body.userId);
            if (liker && post.userid !== req.body.userId) { // Don't notify if user likes their own post
                const notification = new Notification({
                    userid: post.userid, // Post owner gets the notification
                    senderid: req.body.userId,
                    image: liker.profilepic,
                    title: "New Like",
                    msg: `${liker.fname} ${liker.lname} liked your photo.`,
                    date: new Date()
                });
                await notification.save();
            }
            // ----------------------------------------

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
        const currentUser = await User.findById(req.body.userId);
        const userPosts = await Post.find({ userid: currentUser._id });
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId) => {
                return Post.find({ userid: friendId });
            })
        );
        const allPosts = userPosts.concat(...friendPosts);

        // Sort the combined array in Javascript
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