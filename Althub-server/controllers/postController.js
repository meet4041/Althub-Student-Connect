import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import Institute from "../models/instituteModel.js";
import Admin from "../models/adminModel.js";
import AlumniOffice from "../models/alumniModel.js";
import PlacementCell from "../models/placementModel.js";
import Notification from "../models/notificationModel.js";
import { uploadFromBuffer, connectToMongo } from "../db/conn.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { badRequest, forbidden, notFound } from "../utils/httpError.js";

/**
 * Shared aggregation pipeline stages that join all 5 actor collections
 * (user, institute, alumni_office, placement_cell, admin) and resolve
 * displayName + displayAvatar based on the post's createdByRole field.
 */
const buildActorLookupStages = () => [
    // Resolve the poster's ObjectId from the string field
    {
        $addFields: {
            _resolvedId: {
                $cond: [
                    { $ifNull: ['$userid', false] },
                    { $toObjectId: '$userid' },
                    { $toObjectId: '$senderid' }
                ]
            }
        }
    },
    // --- Lookup all 5 possible actor collections ---
    {
        $lookup: {
            from: User.collection.name,
            localField: '_resolvedId', foreignField: '_id',
            as: '_u'
        }
    },
    {
        $lookup: {
            from: Institute.collection.name,
            localField: '_resolvedId', foreignField: '_id',
            as: '_i'
        }
    },
    {
        $lookup: {
            from: Admin.collection.name,
            localField: '_resolvedId', foreignField: '_id',
            as: '_a'
        }
    },
    {
        $lookup: {
            from: AlumniOffice.collection.name,
            localField: '_resolvedId', foreignField: '_id',
            as: '_ao'
        }
    },
    {
        $lookup: {
            from: PlacementCell.collection.name,
            localField: '_resolvedId', foreignField: '_id',
            as: '_pc'
        }
    },
    // Merge the correct name & avatar based on createdByRole
    {
        $addFields: {
            fname: {
                $switch: {
                    branches: [
                        // student / alumni user
                        { case: { $gt: [{ $size: '$_u' }, 0] }, then: { $arrayElemAt: ['$_u.fname', 0] } },
                        // institute
                        { case: { $gt: [{ $size: '$_i' }, 0] }, then: { $arrayElemAt: ['$_i.name', 0] } },
                        // admin
                        { case: { $gt: [{ $size: '$_a' }, 0] }, then: { $arrayElemAt: ['$_a.name', 0] } },
                        // alumni office
                        { case: { $gt: [{ $size: '$_ao' }, 0] }, then: { $arrayElemAt: ['$_ao.name', 0] } },
                        // placement cell
                        { case: { $gt: [{ $size: '$_pc' }, 0] }, then: { $arrayElemAt: ['$_pc.name', 0] } },
                    ],
                    default: { $ifNull: ['$fname', 'Unknown'] }
                }
            },
            lname: {
                $cond: [
                    { $gt: [{ $size: '$_u' }, 0] },
                    { $arrayElemAt: ['$_u.lname', 0] },
                    { $ifNull: ['$lname', ''] }
                ]
            },
            profilepic: {
                $switch: {
                    branches: [
                        { case: { $gt: [{ $size: '$_u' }, 0] }, then: { $arrayElemAt: ['$_u.profilepic', 0] } },
                        { case: { $gt: [{ $size: '$_i' }, 0] }, then: { $arrayElemAt: ['$_i.image', 0] } },
                        { case: { $gt: [{ $size: '$_a' }, 0] }, then: { $arrayElemAt: ['$_a.profilepic', 0] } },
                        { case: { $gt: [{ $size: '$_ao' }, 0] }, then: { $arrayElemAt: ['$_ao.image', 0] } },
                        { case: { $gt: [{ $size: '$_pc' }, 0] }, then: { $arrayElemAt: ['$_pc.image', 0] } },
                    ],
                    default: { $ifNull: ['$profilepic', ''] }
                }
            },
            // Expose a resolved role so the frontend can show a badge if needed
            actorRole: {
                $switch: {
                    branches: [
                        { case: { $gt: [{ $size: '$_u' }, 0] }, then: 'student' },
                        { case: { $gt: [{ $size: '$_i' }, 0] }, then: 'institute' },
                        { case: { $gt: [{ $size: '$_a' }, 0] }, then: 'admin' },
                        { case: { $gt: [{ $size: '$_ao' }, 0] }, then: 'alumni_office' },
                        { case: { $gt: [{ $size: '$_pc' }, 0] }, then: 'placement_cell' },
                    ],
                    default: '$createdByRole'
                }
            }
        }
    },
    // Clean up temp lookup arrays
    { $unset: ['_u', '_i', '_a', '_ao', '_pc', '_resolvedId'] }
];

const addPost = asyncHandler(async (req, res) => {
        await connectToMongo();

        const ownerId = req.user ? req.user._id.toString() : (req.body.userid || req.body.senderid);
        if (!ownerId) {
            throw badRequest("user identification missing");
        }

        // Handle Images
        let photoIds = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const filename = `post-${Date.now()}-${file.originalname}`;
                const fileId = await uploadFromBuffer(file.buffer, filename, file.mimetype);
                photoIds.push(`/api/images/${fileId}`);
            }
        }

        const newPost = new Post({
            userid: ownerId,
            senderid: ownerId,
            
            title: req.body.title || "Update",
            description: req.body.description,
            date: req.body.date || new Date(),
            photos: photoIds
        });

        const savedPost = await newPost.save();

        res.status(200).send({ success: true, msg: "Post Added Successfully", data: savedPost });
});

// --- 2. GET POST BY ID (MATCHING FIX) ---
const getPostById = asyncHandler(async (req, res) => {
        const id = req.params.userid;
        const post_data = await Post.aggregate([
            { $match: { $or: [{ userid: id }, { senderid: id }] } },
            { $sort: { date: -1 } },
            ...buildActorLookupStages()
        ]);
        res.status(200).send({ success: true, data: post_data });
});

// --- 3. EDIT POST ---
const editPost = asyncHandler(async (req, res) => {
        await connectToMongo();
        
        const { id, title, description } = req.body;
        
        const post = await Post.findById(id);
        if (!post) {
            throw notFound("Post not found");
        }
        const ownerId = (post.userid || post.senderid || '').toString();
        const requesterId = req.user?._id?.toString();
        if (requesterId && ownerId && requesterId !== ownerId) {
            throw forbidden('Forbidden: cannot edit this post');
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
});

// --- OTHER FUNCTIONS (Keep as they are) ---

const getPosts = asyncHandler(async (req, res) => {
        const post_data = await Post.aggregate([
            { $sort: { date: -1 } },
            { $limit: 50 },
            ...buildActorLookupStages()
        ]);
        res.status(200).send({ success: true, data: post_data });
});

const deletePost = asyncHandler(async (req, res) => {
        const id = req.params.id;
        const post = await Post.findById(id).lean();
        if (!post) {
            throw notFound('Post not found');
        }
        const ownerId = (post.userid || post.senderid || '').toString();
        const requesterId = req.user?._id?.toString();
        if (requesterId && ownerId && requesterId !== ownerId) {
            throw forbidden('Forbidden: cannot delete this post');
        }
        await Post.deleteOne({ _id: id });
        res.status(200).send({ success: true, msg: 'Post Deleted successfully' });
});

const likeUnlikePost = asyncHandler(async (req, res) => {
        const actingUserId = req.user._id.toString(); // IDOR PREVENTED
        const post = await Post.findById(req.params.id);
        if (!post) throw notFound("Post not found");
        if (!post.likes.includes(actingUserId)) {
            await post.updateOne({ $push: { likes: actingUserId } });
            
            // Notification logic
            try {
                const liker = await User.findById(actingUserId);
                if (liker && post.userid !== actingUserId) { 
                    const notification = new Notification({
                        userid: post.userid || post.senderid, // Handle both
                        senderid: actingUserId,
                        image: liker.profilepic,
                        title: "New Like",
                        msg: `${liker.fname} ${liker.lname} liked your photo.`,
                        date: new Date()
                    });
                    await notification.save();
                }
            } catch (notifyErr) {
                console.warn("Notification error (non-fatal):", notifyErr.message);
            }

            res.status(200).send({ msg: "Like" });
        } else {
            await post.updateOne({ $pull: { likes: actingUserId } });
            res.status(200).send({ msg: "disliked" });
        }
});

const getFriendsPost = asyncHandler(async (req, res) => {
        const actingUserId = req.user._id.toString(); // IDOR PREVENTED
        const currentUser = await User.findById(actingUserId).lean();
        if (!currentUser) throw notFound("User not found");

        const userPosts = await Post.find({ userid: currentUser._id }).lean();
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId) => {
                return Post.find({ userid: friendId }).lean();
            })
        );
        const allPosts = userPosts.concat(...friendPosts);
        allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.status(200).json(allPosts);
});

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
