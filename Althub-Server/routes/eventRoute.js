const express = require("express");
const event_route = express.Router(); // FIX: Use Router
const { uploadArray } = require('../db/storage');
const event_controller = require("../controllers/eventController");
const requireAuth = require("../middleware/auth"); // Recommended to add this for protection

const uploadPic = (req, res, next) => {
    const uploadMiddleware = uploadArray('photos', 5);
    uploadMiddleware(req, res, (err) => {
        if (err) return res.status(400).send({ success: false, message: 'Upload error: ' + err.message });
        
        req.images = (req.files || []).map((f) => {
            const fid = f.id || f._id || (f.fileId && f.fileId.toString());
            return `/api/images/${fid}`;
        });
        next();
    });
}

// Routes
event_route.post('/addEvent', uploadPic, event_controller.addEvents);
event_route.get('/getEvents', event_controller.getEvents);
// This route is called by Dashboard. If token fails here, dashboard bounces.
event_route.get('/getEventsByInstitute/:organizerid', event_controller.getEventsByInstitute);
event_route.delete('/deleteEvent/:id', event_controller.deleteEvent);
event_route.post('/editEvent', uploadPic, event_controller.editEvent);
event_route.get('/searchEvent', event_controller.searchEvent);
event_route.get('/getUpcommingEvents', event_controller.getUpcommingEvents);
event_route.put("/participateInEvent/:id", event_controller.participateInEvent);

module.exports = event_route;