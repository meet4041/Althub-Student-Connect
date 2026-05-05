export {
    registerAdmin,
    adminLogin,
    adminLogout
} from "./admin/authController.js";

export {
    updatePassword,
    forgetPassword,
    resetpassword
} from "./admin/passwordController.js";

export {
    updateAdmin,
    getAdminById
} from "./admin/profileController.js";

export {
    getAllAlumniOffices,
    getAllPlacementCells,
    getUsersByInstitute,
    getUsersByInstituteName,
    getUsers,
    deleteUser,
    getPlacementCells,
    getAlumniOffices
} from "./admin/directoryController.js";
