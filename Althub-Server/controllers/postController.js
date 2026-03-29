import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import Institute from "../models/instituteModel.js";
import AlumniOffice from "../models/alumniModel.js";
import PlacementCell from "../models/placementModel.js";
import Admin from "../models/adminModel.js";
import Notification from "../models/notificationModel.js";
import { uploadFromBuffer, connectToMongo } from "../db/conn.js";

const getActorDisplayFields = (actor, body = {}) => {
    const role = actor?.role || body.createdByRole || "student";
    const actorName = actor?.name || "";
    const actorFirstName = actor?.fname || "";
    const actorLastName = actor?.lname || "";
    const displayName = actorName || [actorFirstName, actorLastName].filter(Boolean).join(" ").trim();
    const profileImage = actor?.profilepic || actor?.image || body.profilepic || "";

    if (role === "student") {
        return {
            fname: actorFirstName || body.fname || "",
            lname: actorLastName || body.lname || "",
            companyname: body.companyname || "",
            profilepic: profileImage,
            createdByRole: role
        };
    }

    return {
        fname: displayName || body.fname || role,
        lname: "",
        companyname: displayName || body.companyname || "",
        profilepic: profileImage,
        createdByRole: role
    };
};

const findActorById = async (id) => {
    if (!id) return null;

    let actor = await User.findById(id).lean();
    if (actor) return actor;

    actor = await Institute.findById(id).lean();
    if (actor) return actor;

    actor = await AlumniOffice.findById(id).lean();
    if (actor) return actor;

    actor = await PlacementCell.findById(id).lean();
    if (actor) return actor;

    actor = await Admin.findById(id).lean();
    return actor;
};

const enrichPostActor = async (post) => {
    const actorId = (post.userid || post.senderid || "").toString();
    const actor = await findActorById(actorId);
    if (!actor) return post;

    const actorFields = getActorDisplayFields(actor, post);
    return {
        ...post,
        fname: actorFields.fname || post.fname,
        lname: actorFields.lname ?? post.lname,
        companyname: actorFields.companyname || post.companyname,
        profilepic: actorFields.profilepic || post.profilepic,
        createdByRole: actorFields.createdByRole || post.createdByRole
    };
};

const addPost = async (req, res) => {
    try {
        await connectToMongo();

        // Handle Images
        let photoIds = [];
        if (req.files && req.files.length > 0) {
            const MAX_FILES = 5;
            if (req.files.length > MAX_FILES) {
                return res.status(400).send({ success: false, msg: 'Too many files uploaded' });
            }
            
            for (const file of req.files) {
                if (!file.buffer || !file.originalname) continue;
                const filename = `post-${Date.now()}-${file.originalname}`;
                const fileId = await uploadFromBuffer(file.buffer, filename, file.mimetype);
                photoIds.push(`/api/images/${fileId}`);
            }
        }

<<<<<<< HEAD
        // Limit description length
        const description = typeof req.body.description === 'string' ? req.body.description.slice(0, 5000) : '';

        const newPost = new Post({
            // FIX: Save 'senderid' from frontend into 'userid' field in DB
            // This ensures getPostById finds it later.
            userid: req.body.senderid || req.body.userid, 
            senderid: req.body.senderid || req.body.userid, // Optional: Keep both if needed for notifications
            fname: req.body.fname,
            lname: req.body.lname,
            companyname: req.body.companyname,
            profilepic: req.body.profilepic,
=======
        const ownerId = req.user?._id?.toString() || req.body.userid || req.body.senderid;
        const actorFields = getActorDisplayFields(req.user, req.body);

        const newPost = new Post({
            userid: ownerId,
            senderid: ownerId,
            fname: actorFields.fname,
            lname: actorFields.lname,
            profilepic: actorFields.profilepic,
            companyname: actorFields.companyname,
>>>>>>> c94aaa1 (althub main v2)
            title: req.body.title || "Update",
            description: description,
            date: req.body.date || new Date(),
            photos: photoIds,
            createdByRole: actorFields.createdByRole
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
        const enrichedPosts = await Promise.all(post_data.map(enrichPostActor));
        
        res.status(200).send({ success: true, data: enrichedPosts });
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

        // SECURITY: Only the post owner can edit
        const requesterId = req.user?._id?.toString();
        const postOwnerId = (post.userid || post.senderid || '').toString();
        if (requesterId && postOwnerId && requesterId !== postOwnerId) {
            return res.status(403).send({ success: false, msg: "Forbidden: You can only edit your own posts." });
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
        const enrichedPosts = await Promise.all(post_data.map(enrichPostActor));
        res.status(200).send({ success: true, data: enrichedPosts });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const deletePost = async (req, res) => {
    try {
        const id = req.params.id;
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).send({ success: false, msg: "Post not found" });
        }

        // SECURITY: Only the post owner can delete
        const requesterId = req.user?._id?.toString();
        const postOwnerId = (post.userid || post.senderid || '').toString();
        if (requesterId && postOwnerId && requesterId !== postOwnerId) {
            return res.status(403).send({ success: false, msg: "Forbidden: You can only delete your own posts." });
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