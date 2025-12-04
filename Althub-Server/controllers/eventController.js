const Event = require("../models/EventModel");
const Notification = require("../models/notificationModel"); // Import Notification
const User = require("../models/userModel"); // Import User to notify them
const Institute = require("../models/instituteModel");

const addEvents = async (req, res) => {
    try {
        const event = new Event({
            organizerid: req.body.organizerid,
            title: req.body.title,
            description: req.body.description,
            date: req.body.date,
            venue: req.body.venue,
            photos: req.images
        });

        const event_data = await event.save();

        // --- NEW: Create Notifications for All Users (Broadcast) ---
        const institute = await Institute.findById(req.body.organizerid);
        const users = await User.find({}); // Fetch all users to notify
        
        const notifications = users.map(user => ({
            userid: user._id,
            senderid: req.body.organizerid,
            image: institute ? institute.profilepic : '', // Use institute logo
            title: "New Event",
            msg: `New Event: ${req.body.title} has been added by ${institute ? institute.insname : 'Institute'}.`,
            date: new Date()
        }));
        
        await Notification.insertMany(notifications);
        // -----------------------------------------------------------

        res.status(200).send({ success: true, data: event_data });

    } catch (error) {
        res.status(400).send(error.message);
        console.log("Error in add event : " + error.message);
    }
}

const getEvents = async (req, res) => {
    try {
        const evet_data = await Event.find({});
        res.status(200).send({ success: true, data: evet_data });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const getEventsByInstitute = async (req, res) => {
    try {
        const evet_data = await Event.find({ organizerid: req.params.organizerid });
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
        if (req.images.length != '') {
            var id = req.body.id;
            var title = req.body.title;
            var description = req.body.description;
            var date = req.body.date;
            var venue = req.body.venue;
            var photos = req.images

            const event_data = await Event.findByIdAndUpdate({ _id: id }, { $set: { title: title, description: description, date: date, venue: venue, photos: photos } }, { new: true });
            res.status(200).send({ success: true, msg: 'Event Updated', data: event_data });
        }
        else {
            var id = req.body.id;
            var title = req.body.title;
            var description = req.body.description;
            var date = req.body.date;
            var venue = req.body.venue;

            const event_data = await Event.findByIdAndUpdate({ _id: id }, { $set: { title: title, description: description, date: date, venue: venue } }, { new: true });
            res.status(200).send({ success: true, msg: 'Event Updated', data: event_data });
        }
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
        const event_data = await Event.find({ date: { $gte: start } });
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