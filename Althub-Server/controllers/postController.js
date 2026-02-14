import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import Institute from "../models/instituteModel.js";
import Notification from "../models/notificationModel.js";
import { uploadFromBuffer, connectToMongo } from "../db/conn.js";

const addPost = async (req, res) => {
    try {
        console.log('addPost req.files length:', req.files ? req.files.length : 0);
        let photos = [];
        // 1. If middleware set a single image (legacy)
        if (req.body.image) {
            photos = [req.body.image];
        }

        // 2. If req.images already prepared by middleware
        else if (req.images) {
            photos = req.images;
        }

        // 3. If files were uploaded via uploadArray('photos'), process them
        else if (req.files && req.files.length > 0) {
            // Enforce maximum count and validate that uploader owns the userid
            const MAX_FILES = 5;
            if (req.files.length > MAX_FILES) return res.status(400).send({ success: false, msg: 'Too many files uploaded' });

            // Security: Ensure the authenticated user matches the userid in the body
            if (req.user && req.body.userid && req.user._id.toString() !== req.body.userid.toString()) {
                return res.status(403).send({ success: false, msg: 'Unauthorized: userid mismatch' });
            }

            await connectToMongo();
            for (const file of req.files) {
                // Basic safety: ensure buffer exists
                if (!file.buffer || !file.originalname) continue;
                const filename = `post-${Date.now()}-${file.originalname}`;
                const fileId = await uploadFromBuffer(file.buffer, filename, file.mimetype);
                photos.push(`/api/images/${fileId}`);
            }
            console.log('addPost uploaded photos:', photos);
        }

        // Limit description length
        const description = typeof req.body.description === 'string' ? req.body.description.slice(0, 5000) : '';

        const requesterId = req.user?._id?.toString();
        if (requesterId && req.body.userid && requesterId !== req.body.userid.toString()) {
            return res.status(403).send({ success: false, msg: 'Unauthorized: userid mismatch' });
        }

        const post = new Post({
            userid: req.body.userid || requesterId,
            fname: req.body.fname,
            lname: req.body.lname,
            companyname: req.body.companyname,
            profilepic: req.body.profilepic,
            description: description,
            date: req.body.date || new Date(),
            photos: photos,
            createdByRole: req.user?.role || "institute"
        });

        // FIXED: Changed 'newPost.save()' to 'post.save()'
        const savedPost = await post.save();
        console.log('addPost saved:', savedPost);

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
        await connectToMongo();
        
        const { id, title, description } = req.body;
        
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).send({ success: false, msg: "Post not found" });
        }
        const ownerId = (post.userid || post.senderid || '').toString();
        const requesterId = req.user?._id?.toString();
        if (requesterId && ownerId && requesterId !== ownerId) {
            return res.status(403).send({ success: false, msg: "Forbidden: cannot edit this post" });
        }

        let newPhotoUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const filename = `post-${Date.now()}-${file.originalname}`;
                const fileId = await uploadFromBuffer(file.buffer, filename, file.mimetype);
                newPhotoUrls.push(`/api/images/${fileId}`);
            }
        }

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
        const post = await Post.findById(id).lean();
        if (!post) return res.status(404).send({ success: false, msg: "Post not found" });
        const ownerId = (post.userid || post.senderid || '').toString();
        const requesterId = req.user?._id?.toString();
        if (requesterId && ownerId && requesterId !== ownerId) {
            return res.status(403).send({ success: false, msg: "Forbidden: cannot delete this post" });
        }
        await Post.deleteOne({ _id: id });
        res.status(200).send({ success: true, msg: 'Post Deleted successfully' });
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

export default {
    addPost,
    getPosts,
    deletePost,
    editPost,
    likeUnlikePost,
    getFriendsPost,
    getPostById,
    instituteAddPost
};
