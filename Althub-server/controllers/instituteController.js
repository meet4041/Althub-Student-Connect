import {
    registerInstitute,
    instituteLogin,
    instituteLogout
} from "./institute/authController.js";

import {
    instituteUpdatePassword,
    instituteForgetPassword,
    instituteResetPassword
} from "./institute/passwordController.js";

import {
    getInstitutes,
    getInstituteById,
    updateInstitute,
    deleteInstitute,
    uploadInstituteImage
} from "./institute/profileController.js";

import {
    inviteUser,
    bulkInviteAlumniCsv
} from "./institute/invitesController.js";

import {
    getAlumniOfficeByInstitute,
    getPlacementCellByInstitute
} from "./institute/officeDirectoryController.js";

export {
    registerInstitute,
    instituteLogin,
    instituteLogout,
    instituteUpdatePassword,
    instituteForgetPassword,
    instituteResetPassword,
    getInstitutes,
    getInstituteById,
    updateInstitute,
    deleteInstitute,
    uploadInstituteImage,
    inviteUser,
    bulkInviteAlumniCsv,
    getAlumniOfficeByInstitute,
    getPlacementCellByInstitute
};

export default {
    registerInstitute,
    instituteLogin,
    updateInstitute,
    instituteUpdatePassword,
    instituteForgetPassword,
    instituteResetPassword,
    instituteLogout,
    getInstituteById,
    deleteInstitute,
    getInstitutes,
    inviteUser,
    bulkInviteAlumniCsv,
    uploadInstituteImage,
    getAlumniOfficeByInstitute,
    getPlacementCellByInstitute
};
