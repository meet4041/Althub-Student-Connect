const express = require("express");
const event_route = express();
const bodyParser = require("body-parser");
event_route.use(bodyParser.json());
event_route.use(bodyParser.urlencoded({ extended: true }));
const { uploadArray } = require('../db/storage');

// upload multiple files using multer-gridfs-storage and set req.images to /api/images/:id
const uploadPic = (req, res, next) => {
    const uploadMiddleware = uploadArray('photos', 5);
    uploadMiddleware(req, res, (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).send({ success: false, message: 'File upload error: ' + err.message });
        }
        if (!req.files || req.files.length === 0) {
            req.images = [];
            return next();
        }
        try {
            req.images = req.files.map((f) => {
                const fid = f.id || f._id || (f.fileId && f.fileId.toString());
                return `/api/images/${fid}`;
            });
            return next();
        } catch (e) {
            console.error('Error mapping uploaded files', e.message);
            return res.status(500).send({ success: false, msg: e.message });
        }
    });
}

const event_controller = require("../controllers/eventController");

//event routes
event_route.post('/addEvent', uploadPic, event_controller.addEvents);
event_route.get('/getEvents', event_controller.getEvents);
event_route.get('/getEventsByInstitute/:organizerid', event_controller.getEventsByInstitute);
event_route.delete('/deleteEvent/:id', event_controller.deleteEvent);
event_route.post('/editEvent', uploadPic, event_controller.editEvent);
event_route.get('/searchEvent', event_controller.searchEvent);
event_route.get('/getUpcommingEvents', event_controller.getUpcommingEvents);
event_route.put("/participateInEvent/:id", event_controller.participateInEvent);

module.exports = event_route;