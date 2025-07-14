import { Router } from "express";
// Controllers
import adminBanUser from "../controllers/adminBanUser.js";
import adminGetUsers from "../controllers/adminGetUsers.js";
import changeName from "../controllers/changeName.js";
import changeProfilePic from "../controllers/changeProfilePic.js";
import deletePofilePic from "../controllers/deletePofilePic.js";
import editBrief from "../controllers/editBrief.js";
import followUser from "../controllers/followUser.js";
import getFollowers from "../controllers/getFollowers.js";
import getFollowings from "../controllers/getFollowings.js";
import getPreferredCategories from "../controllers/getPreferredCategories.js";
import getPreferredTopics from "../controllers/getPreferredTopics.js";
import getUserProfile from "../controllers/getUserProfile.js";
import removePreferredTopics from "../controllers/removePreferredTopics.js";
import searchForUsers from "../controllers/searchForUsers.js";
import setPreferredCategories from "../controllers/setPreferredCategories.js";
import setPreferredTopics from "../controllers/setPreferredTopics.js";
import unfollowUser from "../controllers/unfollowUser.js";
import updateCookiesAccess from "../controllers/updateCookiesAccess.js";
import removePreferredCategories from "../controllers/removePreferredCategories.js";

// Middlewares
import downloadProfilePic from "../../../publicMiddlewares/downloadProfilePic.js";
import isAdmin from "../../../publicMiddlewares/isAdmin.js";
import isAuthenticated from "../../../publicMiddlewares/isAuthenticated.js";
import isLoggedIn from "../../../publicMiddlewares/isLoggedIn.js";
import adminBanUserValidate from "../middlewares/adminBanUser.validate.js";
import changeNameValidate from "../middlewares/changeName.validate.js";
import editBriefValidate from "../middlewares/editBrief.validate.js";
import getDataValidate from "../middlewares/getData.validate.js";
import removePreferredDataValidate from "../middlewares/removePreferredData.validate.js";
import searchForUsersValidate from "../middlewares/searchForUsers.validate.js";
import setPreferredDataValidate from "../middlewares/setPreferredData.validate.js";
import updateCookiesAccessValidate from "../middlewares/updateCookiesAccess.validate.js";

const userRoutes = Router();

// User can change detials like name
userRoutes.patch(
    "/users/name",
    isAuthenticated,
    changeNameValidate,
    changeName
);

// And profile pic
userRoutes.patch(
    "/users/profile-pic",
    isAuthenticated,
    downloadProfilePic,
    changeProfilePic
);
// Or delete the existing one
userRoutes.delete("/users/profile-pic", isAuthenticated, deletePofilePic);

// User can edit the brief
userRoutes.patch("/users/brief", isAuthenticated, editBriefValidate, editBrief);

// User can allow cookies or refuse it
userRoutes.patch(
    "/users/cookies",
    isAuthenticated,
    updateCookiesAccessValidate,
    updateCookiesAccess
);

// User can follow and unfollow another user
userRoutes.post("/users/followings/:followedId", isAuthenticated, followUser);
userRoutes.delete(
    "/users/followings/:followedId",
    isAuthenticated,
    unfollowUser
);

// User can manage his preferred categories and topics
userRoutes.post(
    "/users/categories/preferred",
    isAuthenticated,
    setPreferredDataValidate,
    setPreferredCategories
);
userRoutes.get(
    "/users/categories/preferred",
    isAuthenticated,
    getDataValidate,
    getPreferredCategories
);

// Patch because there is a body
userRoutes.patch(
    "/users/categories/preferred",
    isAuthenticated,
    removePreferredDataValidate,
    removePreferredCategories
);

userRoutes.post(
    "/users/topics/preferred",
    isAuthenticated,
    setPreferredDataValidate,
    setPreferredTopics
);
userRoutes.get(
    "/users/topics/preferred",
    isAuthenticated,
    getDataValidate,
    getPreferredTopics
);

// Patch because there is a body
userRoutes.patch(
    "/users/topics/preferred",
    isAuthenticated,
    removePreferredDataValidate,
    removePreferredTopics
);

// Anyone can search for users (by name)
userRoutes.get("/users", isLoggedIn, searchForUsersValidate, searchForUsers);

// For getting user profile data (contains followers and following counts)
userRoutes.get("/users/:userId", getUserProfile);

// User can see his followers
userRoutes.get("/users/:userId/followers", getDataValidate, getFollowers);
// User can see his followings
userRoutes.get("/users/:userId/followings", getDataValidate, getFollowings);

// Admin can browse users
userRoutes.get(
    "/admin/users",
    isAuthenticated,
    isAdmin,
    getDataValidate,
    adminGetUsers
);

// Admin can ban users from publishing articles
userRoutes.post(
    "/users/ban/:userId",
    isAuthenticated,
    isAdmin,
    adminBanUserValidate,
    adminBanUser
);

export default userRoutes;
