import Experience from "../models/experienceModel.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { badRequest } from "../utils/httpError.js";

const addExperience = asyncHandler(async (req, res) => {
    const experience = new Experience({
        userid: req.body.userid,
        companyname: req.body.companyname,
        position: req.body.position,
        joindate: req.body.joindate,
        enddate: req.body.enddate,
        companylogo: req.body.companylogo,
        description: req.body.description
    });

    const experience_data = await experience.save();
    res.status(200).send({ success: true, data: experience_data });
});

const getExperience = asyncHandler(async (req, res) => {
    const experience_data = await Experience.find({ userid: req.body.userid });
    res.status(200).send({ success: true, data: experience_data });
});

const deleteExperience = asyncHandler(async (req, res) => {
    const id = req.params.id;
    await Experience.deleteOne({ _id: id });
    res.status(200).send({ success: true, msg: 'experience Deleted successfully' });
});

const editExperience = asyncHandler(async (req, res) => {
    const experience_data = await Experience.findByIdAndUpdate(
        { _id: req.body._id },
        { $set: req.body },
        { new: true }
    );

    res.status(200).send({ success: true, msg: 'experience Updated', data: experience_data });
});

const uploadExperienceImage = asyncHandler(async (req, res) => {
    if (!req.file) throw badRequest("plz select a file");

    const picture = {
        url: '/experienceImages/' + req.file.filename,
    };
    res.status(200).send({ success: true, data: picture });
});

export default {
    addExperience,
    getExperience,
    deleteExperience,
    editExperience,
    uploadExperienceImage
};
