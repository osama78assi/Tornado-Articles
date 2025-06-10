import { Router } from "express";
// Controllers
import adminDeleteUser from "../controllers/adminDeleteUser";
import adminGetUsers from "../controllers/adminGetUsers";
import changeName from "../controllers/changeName";
import deleteAccount from "../controllers/deleteAccount";
import followUser from "../controllers/followUser";
import getPreferredCategories from "../controllers/getPreferredCategories";
import getUserDetails from "../controllers/getUserDetails";
import searchForUsers from "../controllers/searchForUsers";
import setPreferredCategories from "../controllers/setPreferredCategories";
import unfollowUser from "../controllers/unfollowUser";
import updatedPreferredCategories from "../controllers/updatePreferredCategories";
import changeProfilePic from "../controllers/changeProfilePic";
import deletePofilePic from "../controllers/deletePofilePic";
import editBrief from "../controllers/editBrief";
import getFollowers from "../controllers/getFollowers";
import getFollowings from "../controllers/getFollowings";
import updateCookiesAccess from "../controllers/updateCookiesAccess";

// Middlewares
import downloadProfilePic from "../middlewares/downloadProfilePic";
import isAdmin from "../../../publicMiddlewares/isAdmin";
import isAuthenticated from "../../../publicMiddlewares/isAuthenticated";
import isLoggedIn from "../../../publicMiddlewares/isLoggedIn";

const userRoutes = Router();

// User can change detials like name
userRoutes.patch("/users/name", isAuthenticated, changeName);
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
userRoutes.patch("/users/brief", isAuthenticated, editBrief);

// User can allow cookies or refuse it
userRoutes.patch("/users/cookies", isAuthenticated, updateCookiesAccess);

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
    setPreferredCategories
);
userRoutes.get(
    "/users/preferred-categories",
    isAuthenticated,
    getPreferredCategories
);
userRoutes.patch(
    "/users/preferred-categories",
    isAuthenticated,
    updatedPreferredCategories
);

// User can delete his/her account
userRoutes.delete("/users", isAuthenticated, deleteAccount);

// Anyone can search for users (by name)
userRoutes.get("/users", isLoggedIn, searchForUsers);
// For getting user profile data (contains followers and following counts)
userRoutes.get("/users/:userId", getUserDetails);

// User can see his followers
userRoutes.get("/users/:userId/followers", getFollowers);
// User can see his followings
userRoutes.get("/users/:userId/followings", getFollowings);

// Admin can delete user account
userRoutes.delete(
    "/admin/users/:userId",
    isAuthenticated,
    isAdmin,
    adminDeleteUser
);
// Admin can browse users
userRoutes.get("/admin/users", isAuthenticated, isAdmin, adminGetUsers);

export default userRoutes;
