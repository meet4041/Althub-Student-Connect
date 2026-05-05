import express from "express";
import PortalAnnouncement from "../models/portalAnnouncementModel.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { badRequest } from "../utils/httpError.js";

const portal_announcement_route = express.Router();

const defaultAnnouncement = {
    title: "Admin Portal Notice",
    message: "Use this space for platform-wide instructions, maintenance notes, or operational updates from the super admin team.",
    isActive: true,
};

portal_announcement_route.get("/portalAnnouncement", requireAuth, asyncHandler(async (req, res) => {
    const announcement = await PortalAnnouncement.findOne({ isActive: true }).sort({ updatedAt: -1 }).lean();
    return res.status(200).json({
        success: true,
        data: announcement || defaultAnnouncement,
    });
}));

portal_announcement_route.put("/portalAnnouncement", requireAuth, requireRole("admin"), asyncHandler(async (req, res) => {
    const title = String(req.body.title || "").trim();
    const message = String(req.body.message || "").trim();
    const isActive = req.body.isActive !== false;

    if (!title) throw badRequest("Announcement title is required");
    if (!message) throw badRequest("Announcement message is required");
    if (title.length > 120) throw badRequest("Announcement title is too long");
    if (message.length > 600) throw badRequest("Announcement message is too long");

    const announcement = await PortalAnnouncement.findOneAndUpdate(
        {},
        {
            title,
            message,
            isActive,
            updatedBy: req.user?._id || null,
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    return res.status(200).json({ success: true, data: announcement });
}));

export default portal_announcement_route;
