export {
    registerUser,
    userlogin,
    refreshToken,
    userLogout,
    getMyAuth
} from "./user/authController.js";

export {
    updatePassword,
    forgetPassword,
    resetpassword
} from "./user/passwordController.js";

export {
    userProfileEdit,
    deleteUser,
    uploadUserImage,
    updateProfilePic,
    deleteProfilePic
} from "./user/profileController.js";

export {
    searchUser,
    searchUserById,
    getUsers,
    getTopUsers,
    getUsersOfInstitute,
    getAlumniByCourseSpec,
    getRandomUsers
} from "./user/directoryController.js";

export {
    followUser,
    unfollowUser
} from "./user/socialController.js";
