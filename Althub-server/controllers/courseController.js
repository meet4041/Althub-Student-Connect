import Course from "../models/courseModel.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const addCourse = asyncHandler(async (req, res) => {
    const course = new Course({
        instituteid: req.body.instituteid,
        name: req.body.name,
        stream: req.body.stream,
        duration: req.body.duration
    });

    const course_data = await course.save();
    res.status(200).send({ success: true, data: course_data });
});

const getCourse = asyncHandler(async (req, res) => {
    const course_data = await Course.find({});
    res.status(200).send({ success: true, data: course_data });
});

const getCourseByInstitute = asyncHandler(async (req, res) => {
    const course_data = await Course.find({ instituteid: req.params.instituteid });
    res.status(200).send({ success: true, data: course_data });
});

const deleteCourse = asyncHandler(async (req, res) => {
    const id = req.params.id;
    await Course.deleteOne({ _id: id });
    res.status(200).send({ success: true, msg: 'Course Deleted successfully' });
});

const editCourse = asyncHandler(async (req, res) => {
    const { id, name, stream, duration } = req.body;
    const course_data = await Course.findByIdAndUpdate(
        { _id: id },
        { $set: { name, stream, duration } },
        { new: true }
    );

    res.status(200).send({ success: true, msg: 'Course Updated', data: course_data });
});

export default {
    addCourse,
    getCourse,
    deleteCourse,
    editCourse,
    getCourseByInstitute
};
