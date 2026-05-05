import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { requireAuth } from "../middleware/authMiddleware.js";
import course_controller from "../controllers/courseController.js";

const course_route = express.Router();

course_route.use(bodyParser.json());
course_route.use(bodyParser.urlencoded({ extended: true }));
course_route.use(cookieParser());

// course routes
course_route.post('/addCourse', course_controller.addCourse);
course_route.get('/getCourse', course_controller.getCourse);
course_route.delete('/deleteCourse/:id', course_controller.deleteCourse);
course_route.post('/editCourse', course_controller.editCourse);
course_route.get('/getCourseByInstitute/:instituteid', course_controller.getCourseByInstitute);

export default course_route;