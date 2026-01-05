import Event from "../models/EventModel.js";
import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";
import Institute from "../models/instituteModel.js";
import { uploadFromBuffer, connectToMongo } from "../db/conn.js";

// ... [Keep your other functions like addEvents, getEvents, deleteEvent exactly as they were] ...

const addEvents = async (req, res) => {
    try {
        await connectToMongo();
        let photoIds = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const filename = `event-${Date.now()}-${file.originalname}`;
                const fileId = await uploadFromBuffer(file.buffer, filename, file.mimetype);
                photoIds.push(`/api/images/${fileId}`);
            }
        }
        const event = new Event({
            organizerid: req.body.organizerid,
            title: req.body.title,
            description: req.body.description,
            date: req.body.date,
            venue: req.body.venue,
            photos: photoIds
        });
        const event_data = await event.save();
        
        // Notifications Logic
        const institute = await Institute.findById(req.body.organizerid);
        const users = await User.find({});
        const notifications = users.map(user => ({
            userid: user._id,
            senderid: req.body.organizerid,
            image: institute ? institute.profilepic : '',
            title: "New Event",
            msg: `New Event: ${req.body.title} has been added by ${institute ? institute.insname : 'Institute'}.`,
            date: new Date()
        }));
        await Notification.insertMany(notifications);

        res.status(200).send({ success: true, data: event_data });
    } catch (error) {
        res.status(400).send(error.message);
    }
}

// ... [Include getEvents, getEventsByInstitute, deleteEvent here] ...

const getEvents = async (req, res) => {
    try {
        const evet_data = await Event.find({}).lean();
        res.status(200).send({ success: true, data: evet_data });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const getEventsByInstitute = async (req, res) => {
    try {
        const evet_data = await Event.find({ organizerid: req.params.organizerid }).lean();
        res.status(200).send({ success: true, data: evet_data });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const deleteEvent = async (req, res) => {
    try {
        const id = req.params.id;
        await Event.deleteOne({ _id: id });
        res.status(200).send({ success: true, msg: 'Event Deleted successfully' });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

// --- FIXED EDIT EVENT FUNCTION ---
const editEvent = async (req, res) => {
    try {
        await connectToMongo();

        const { id, title, description, date, venue } = req.body;

        // 1. Find existing event to get current photos
        const existingEvent = await Event.findById(id);
        if (!existingEvent) {
            return res.status(404).send({ success: false, msg: 'Event not found' });
        }

        // 2. Handle New File Uploads
        let newPhotoUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const filename = `event-${Date.now()}-${file.originalname}`;
                const fileId = await uploadFromBuffer(file.buffer, filename, file.mimetype);
                newPhotoUrls.push(`/api/images/${fileId}`);
            }
        }

        // 3. Combine existing photos with new ones (Appends new photos)
        // If you want to completely replace photos, remove `...existingEvent.photos`
        const updatedPhotos = [...(existingEvent.photos || []), ...newPhotoUrls];

        // 4. Update the event
        const updateData = {
            title,
            description,
            date,
            venue,
            photos: updatedPhotos
        };

        const event_data = await Event.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        res.status(200).send({ success: true, msg: 'Event Updated Successfully', data: event_data });

    } catch (error) {
        console.error("Edit Event Error:", error);
        res.status(400).send({ success: false, msg: error.message });
    }
}

// ... [Include searchEvent, getUpcommingEvents, participateInEvent here] ...

const searchEvent = async (req, res) => {
    try {
        var search = req.body.search;
        var event_data = await Event.find({ "title": { $regex: ".*" + search + ".*" } });
        if (event_data.length > 0) {
            res.status(200).send({ success: true, msg: "Event Details", data: event_data });
        }
        else {
            res.status(200).send({ success: true, msg: 'Event not Found' });
        }
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const getUpcommingEvents = async (req, res) => {
    try {
        let start = Date.now();
        const event_data = await Event.find({ date: { $gte: start } }).lean();
        res.status(200).send({ success: true, data: event_data });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const participateInEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event.participants.includes(req.body.userId)) {
            await event.updateOne({ $push: { participants: req.body.userId } });
            res.status(200).json("Participated in this event Successfully");
        } else {
            res.status(403).json("You have been already participated in this event");
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

export default {
    addEvents,
    getEvents,
    getEventsByInstitute,
    deleteEvent,
    editEvent,
    searchEvent,
    getUpcommingEvents,
    participateInEvent
};