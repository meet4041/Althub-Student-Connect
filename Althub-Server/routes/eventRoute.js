const express = require("express");
const event_route = express.Router();
// Import the upload middleware
const { uploadArray } = require('../db/storage'); 
const event_controller = require("../controllers/eventController");
const { requireAuth } = require("../middleware/authMiddleware");

// --- PROTECTED ROUTES ---

// Add Event
event_route.post('/addEvent', requireAuth, uploadArray('photos', 5), event_controller.addEvents);

// Delete Event
event_route.delete('/deleteEvent/:id', requireAuth, event_controller.deleteEvent);

// Edit Event (FIXED: Added uploadArray middleware)
event_route.post('/editEvent', requireAuth, uploadArray('photos', 5), event_controller.editEvent);

// Participate
event_route.put("/participateInEvent/:id", requireAuth, event_controller.participateInEvent);

// --- PUBLIC ROUTES (Viewing Data) ---
event_route.get('/getEventsByInstitute/:organizerid', event_controller.getEventsByInstitute);
event_route.get('/getEvents', event_controller.getEvents);
event_route.get('/searchEvent', event_controller.searchEvent);
event_route.get('/getUpcommingEvents', event_controller.getUpcommingEvents);

module.exports = event_route;