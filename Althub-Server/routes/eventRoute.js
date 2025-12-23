const express = require("express");
const event_route = express.Router();
const { uploadArray } = require('../db/storage');
const event_controller = require("../controllers/eventController");
const { requireAuth } = require("../middleware/authMiddleware"); // Import the version-checking middleware

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

// PROTECTED ROUTES - requireAuth is now the gatekeeper
event_route.post('/addEvent', requireAuth, event_controller.addEvents);
event_route.get('/getEvents', requireAuth, event_controller.getEvents);
event_route.get('/getEventsByInstitute/:organizerid', requireAuth, event_controller.getEventsByInstitute); // FIXED
event_route.delete('/deleteEvent/:id', requireAuth, event_controller.deleteEvent);
event_route.post('/editEvent', requireAuth, event_controller.editEvent);
event_route.get('/searchEvent', requireAuth, event_controller.searchEvent);
event_route.get('/getUpcommingEvents', requireAuth, event_controller.getUpcommingEvents);
event_route.put("/participateInEvent/:id", requireAuth, event_controller.participateInEvent);

module.exports = event_route;