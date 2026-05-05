import Education from "../models/educationModel.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { badRequest } from "../utils/httpError.js";

const addEducation = asyncHandler(async (req, res) => {
    const education = new Education({
        userid: req.body.userid,
        institutename: req.body.institutename,
        course: req.body.course,
        specialization: req.body.specialization,
        joindate: req.body.joindate,
        enddate: req.body.enddate,
        collagelogo: req.body.collagelogo
    });

    const education_data = await education.save();
    res.status(200).send({ success: true, data: education_data });
});

const getEducation = asyncHandler(async (req, res) => {
    const education_data = await Education.find({ userid: req.body.userid });
    res.status(200).send({ success: true, data: education_data });
});

const deleteEducation = asyncHandler(async (req, res) => {
    const id = req.params.id;
    await Education.deleteOne({ _id: id });
    res.status(200).send({ success: true, msg: 'education Deleted successfully' });
});

const editEducation = asyncHandler(async (req, res) => {
    const { id, institutename, course, specialization, joindate, enddate, collagelogo } = req.body;
    const education_data = await Education.findByIdAndUpdate(
        { _id: id },
        { $set: { institutename, course, specialization, joindate, enddate, collagelogo } },
        { new: true }
    );

    res.status(200).send({ success: true, msg: 'education Updated', data: education_data });
});

const uploadEducationImage = asyncHandler(async (req, res) => {
    if (!req.file) throw badRequest("plz select a file");

    const picture = {
        url: '/educationImages/' + req.file.filename,
    };
    res.status(200).send({ success: true, data: picture });
});

export default {
    addEducation,
    getEducation,
    deleteEducation,
    editEducation,
    uploadEducationImage
};
