import Company from "../models/companyModel.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { badRequest } from "../utils/httpError.js";

const uploadCompanyImage = asyncHandler(async (req, res) => {
    if (!req.file) throw badRequest("plz select a file");

    const picture = {
        url: '/companyImages/' + req.file.filename,
    };
    res.status(200).send({ success: true, data: picture });
});

const addCompany = asyncHandler(async (req, res) => {
    const companydata = await Company.findOne({ name: req.body.name });

    if (companydata) {
        throw badRequest("Company already exists");
    }

    const company = new Company({
        name: req.body.name,
        address: req.body.address,
        phone: req.body.phone,
        email: req.body.email,
        website: req.body.website,
        image: req.body.image
    });

    const company_data = await company.save();
    res.status(200).send({ success: true, data: company_data });
});

const deleteCompany = asyncHandler(async (req, res) => {
    const id = req.params.id;
    await Company.deleteOne({ _id: id });
    res.status(200).send({ success: true, msg: 'Company Deleted successfully' });
});

const getCompanies = asyncHandler(async (req, res) => {
    const company_data = await Company.find({});
    res.status(200).send({ success: true, data: company_data });
});

const searchCompanyById = asyncHandler(async (req, res) => {
    const company = await Company.findById({
        _id: req.params._id
    });
    res.status(200).send({ success: true, data: company });
});

export default {
    addCompany,
    deleteCompany,
    getCompanies,
    searchCompanyById,
    uploadCompanyImage
};
