import { Router } from "express";
// Controllers
import adminGetUsers from "../controllers/adminGetUsers.js";
import changeName from "../controllers/changeName.js";
import changeProfilePic from "../controllers/changeProfilePic.js";
import deletePofilePic from "../controllers/deletePofilePic.js";
import editBrief from "../controllers/editBrief.js";
import followUser from "../controllers/followUser.js";
import getFollowers from "../controllers/getFollowers.js";
import getFollowings from "../controllers/getFollowings.js";
import getPreferredCategories from "../controllers/getPreferredCategories.js";
import getUserProfile from "../controllers/getUserProfile.js";
import searchForUsers from "../controllers/searchForUsers.js";
import setPreferredCategories from "../controllers/setPreferredCategories.js";
import unfollowUser from "../controllers/unfollowUser.js";
import updateCookiesAccess from "../controllers/updateCookiesAccess.js";
import updatedPreferredCategories from "../controllers/updatePreferredCategories.js";

// Middlewares
import downloadProfilePic from "../../../publicMiddlewares/downloadProfilePic.js";
import isAdmin from "../../../publicMiddlewares/isAdmin.js";
import isAuthenticated from "../../../publicMiddlewares/isAuthenticated.js";
import isLoggedIn from "../../../publicMiddlewares/isLoggedIn.js";
import adminBanUser from "../controllers/adminBanUser.js";
import adminBanUserValidate from "../middlewares/adminBanUser.validate.js";
import changeNameValidate from "../middlewares/changeName.validate.js";
import editBriefValidate from "../middlewares/editBrief.validate.js";
import getDataValidate from "../middlewares/getData.validate.js";
import searchForUsersValidate from "../middlewares/searchForUsers.validate.js";
import setPreferredCategoriesValidate from "../middlewares/setPreferredCategories.validate.js";
import updateCookiesAccessValidate from "../middlewares/updateCookiesAccess.validate.js";
import updatePreferredCategoriesValidate from "../middlewares/updatePreferredCategories.validate.js";

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

// User can manage his preferred categories
userRoutes.post(
    "/users/preferred-categories",
    isAuthenticated,
    setPreferredCategoriesValidate,
    setPreferredCategories
);
userRoutes.get(
    "/users/preferred-categories",
    isAuthenticated,
    getDataValidate,
    getPreferredCategories
);
userRoutes.patch(
    "/users/preferred-categories",
    isAuthenticated,
    updatePreferredCategoriesValidate,
    updatedPreferredCategories
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
    "/admin/users/ban/:userId",
    isAuthenticated,
    isAdmin,
    adminBanUserValidate,
    adminBanUser
);

export default userRoutes;
