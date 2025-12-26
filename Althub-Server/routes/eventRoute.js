const express = require("express");
const event_route = express.Router();
const { uploadArray } = require('../db/storage');
const event_controller = require("../controllers/eventController");
const { requireAuth } = require("../middleware/authMiddleware");

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
event_route.delete('/deleteEvent/:id', requireAuth, event_controller.deleteEvent);
event_route.post('/editEvent', requireAuth, event_controller.editEvent);
event_route.put("/participateInEvent/:id", requireAuth, event_controller.participateInEvent);

// --- PUBLIC ROUTES (Viewing Data) ---
event_route.get('/getEventsByInstitute/:organizerid', event_controller.getEventsByInstitute);
event_route.get('/getEvents',event_controller.getEvents);
event_route.get('/searchEvent', event_controller.searchEvent);
event_route.get('/getUpcommingEvents', event_controller.getUpcommingEvents);


module.exports = event_route;