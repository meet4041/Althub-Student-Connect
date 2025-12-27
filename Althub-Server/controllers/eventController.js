const Event = require("../models/EventModel");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");
const Institute = require("../models/instituteModel");
const { uploadFromBuffer, connectToMongo } = require("../db/conn"); // FIX: Imported helpers

const addEvents = async (req, res) => {
    try {
        await connectToMongo();

        // FIX: Process uploaded files from buffers (MemoryStorage)
        // Original code used req.images, but standard Multer gives req.files
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
            photos: photoIds // Use generated IDs/URLs
        });

        const event_data = await event.save();

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
        const result = await Event.deleteOne({ _id: id });
        res.status(200).send({ success: true, msg: 'Event Deleted successfully' });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const editEvent = async (req, res) => {
    try {
        // FIX: Check req.files for new images
        let photos = [];
        
        // If files were uploaded, process them
        if (req.files && req.files.length > 0) {
            await connectToMongo();
            for (const file of req.files) {
                const filename = `event-${Date.now()}-${file.originalname}`;
                const fileId = await uploadFromBuffer(file.buffer, filename, file.mimetype);
                photos.push(`/api/images/${fileId}`);
            }
        } 
        // If no new files, check if old photos were passed in body (optional handling depending on frontend)
        else if (req.body.photos) {
            photos = req.body.photos;
        }

        var id = req.body.id;
        var title = req.body.title;
        var description = req.body.description;
        var date = req.body.date;
        var venue = req.body.venue;

        const updateData = { 
            title, 
            description, 
            date, 
            venue 
        };

        // Only update photos if new ones were provided
        if (photos.length > 0) {
            updateData.photos = photos;
        }

        const event_data = await Event.findByIdAndUpdate(
            { _id: id }, 
            { $set: updateData }, 
            { new: true }
        );
        res.status(200).send({ success: true, msg: 'Event Updated', data: event_data });

    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

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

module.exports = {
    addEvents,
    getEvents,
    deleteEvent,
    editEvent,
    searchEvent,
    getUpcommingEvents,
    getEventsByInstitute,
    participateInEvent
}