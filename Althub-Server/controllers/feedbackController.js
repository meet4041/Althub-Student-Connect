import Feedback from "../models/feedbackModel.js";
import User from "../models/userModel.js";
import Education from "../models/educationModel.js";

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
                // <--- 3. Logic to fetch degree --->
                // Fetch all education records for this user
                const educations = await Education.find({ userid: req.body.selected_user_id });
                
                let degree = "";
                if (educations.length > 0) {
                    // Sort to find the latest education (similar to userController logic)
                    educations.sort((a, b) => {
                        const dateA = new Date(a.enddate || "1900-01-01");
                        const dateB = new Date(b.enddate || "1900-01-01");
                        return dateB - dateA; // Descending order
                    });
                    
                    if (educations[0].course) {
                        degree = ` (${educations[0].course})`; // Create string like " (MSCIT)"
                    }
                }

                // Combine Name + Degree
                targetName = `${target.fname} ${target.lname}${degree}`;
            }
        }

        const feedback = new Feedback({
            userid: req.body.userid,
            name: senderName,           // Saved: Sender's Name
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
}

const getFeedback = async (req, res) => {
    try {
        const feedback_data = await Feedback.find({});
        res.status(200).send({ success: true, data: feedback_data });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const deleteFeedback = async (req, res) => {
    try {
        const id = req.params.id;
        await Feedback.deleteOne({ _id: id });
        res.status(200).send({ success: true, msg: 'Feedback Deleted successfully' });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

export default {
    addFeedback,
    getFeedback,
    deleteFeedback
};