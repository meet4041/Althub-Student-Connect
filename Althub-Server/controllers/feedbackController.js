import Feedback from "../models/feedbackModel.js";
import User from "../models/userModel.js";
import Education from "../models/educationModel.js";

/**
 * Adds a new feedback record.
 * Logic: Fetches the sender's name and the target user's name (including their latest degree).
 */
const addFeedback = async (req, res) => {
    try {
        // 1. Fetch the SENDER (Who is giving the feedback)
        const sender = await User.findById(req.body.userid);
        const senderName = sender ? `${sender.fname} ${sender.lname}` : "Anonymous";

        // 2. Fetch the TARGET (Who the feedback is about)
        let targetName = "General"; // Default if no user selected
        
        if (req.body.selected_user_id) {
            const target = await User.findById(req.body.selected_user_id);
            if (target) {
                // 3. Logic to fetch degree (latest education)
                const educations = await Education.find({ userid: req.body.selected_user_id });
                
                let degree = "";
                if (educations.length > 0) {
                    // Sort to find the latest education
                    educations.sort((a, b) => {
                        const dateA = new Date(a.enddate || "1900-01-01");
                        const dateB = new Date(b.enddate || "1900-01-01");
                        return dateB - dateA; 
                    });
                    
                    if (educations[0].course) {
                        degree = ` (${educations[0].course})`; 
                    }
                }

                // Combine Name + Degree for stored identification
                targetName = `${target.fname} ${target.lname}${degree}`;
            }
        }

        const feedback = new Feedback({
            userid: req.body.userid,
            name: senderName,           // Saved: Sender's Full Name
            selected_user: targetName,  // Saved: "Target Name (Degree)"
            message: req.body.message,
            rate: req.body.rate
        });

        const feedback_data = await feedback.save();
        res.status(200).send({ success: true, data: feedback_data });
    } catch (error) {
        console.error("Feedback Error:", error);
        res.status(400).send({ success: false, msg: "Error in add feedback" });
    }
};

/**
 * Gets all feedback records for the general listing page.
 */
const getFeedback = async (req, res) => {
    try {
        const feedback_data = await Feedback.find({});
        res.status(200).send({ success: true, data: feedback_data });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
};

/**
 * Deletes a feedback record by ID.
 */
const deleteFeedback = async (req, res) => {
    try {
        const id = req.params.id;
        await Feedback.deleteOne({ _id: id });
        res.status(200).send({ success: true, msg: 'Feedback Deleted successfully' });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
};

/**
 * Generates data for the Leaderboard.
 * Rank members by the count of feedback received and average rating.
 */
const getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await Feedback.aggregate([
            {
                // Group by the user who received the feedback
                $group: {
                    _id: "$selected_user",
                    totalFeedback: { $sum: 1 },
                    averageRating: { $avg: "$rate" }
                }
            },
            {
                // Sort by highest volume first, then by quality score
                $sort: { totalFeedback: -1, averageRating: -1 }
            },
            {
                // Project clean labels and round the average
                $project: {
                    name: "$_id",
                    totalFeedback: 1,
                    averageRating: { $round: ["$averageRating", 1] },
                    _id: 0
                }
            }
        ]);

        res.status(200).json({ success: true, data: leaderboard });
    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
};

// CRITICAL: Exporting all functions so feedbackRoute.js can access them
export default {
    addFeedback,
    getFeedback,
    deleteFeedback,
    getLeaderboard
};