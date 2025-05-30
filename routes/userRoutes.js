const { Router } = require("express");
// Controllers
const changeName = require("../controllers/user/changeName");
const deleteAccount = require("../controllers/user/deleteAccount");
const searchForUsers = require("../controllers/user/searchForUsers");
const followUser = require("../controllers/user/followUser");
const unfollowUser = require("../controllers/user/unfollowUser");
const getPreferredCategories = require("../controllers/user/getPreferredCategories");
const setPreferredCategories = require("../controllers/user/setPreferredCategories");
const updatedPreferredCategories = require("../controllers/user/updatePreferredCategories");
const adminDeleteUser = require("../controllers/user/adminDeleteUser");
const adminGetUsers = require("../controllers/user/adminGetUsers");
const getUserDetails = require("../controllers/user/getUserDetails");

// Middlewares
const isAuthenticated = require("../middlewares/isAuthenticated");
const isAdmin = require("../middlewares/isAdmin");
const isLoggedIn = require("../middlewares/isLoggedIn");
const changeProfilePic = require("../controllers/user/changeProfilePic");
const downloadProfilePic = require("../middlewares/downloadProfilePic");
const deletePofilePic = require("../controllers/user/deletePofilePic");
const { updateBrief } = require("../models/user");
const editBrief = require("../controllers/user/editBrief");
const updateCookiesAccess = require("../controllers/user/updateCookiesAccess");

const userRoutes = Router();

// User can change detials like name
userRoutes.patch("/users/name", isAuthenticated, changeName); // DONE
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
userRoutes.post("/users/followings/:followedId", isAuthenticated, followUser); // DONE
userRoutes.delete(
    "/users/followings/:followedId",
    isAuthenticated,
    unfollowUser
); // DONE

// User can manage his preferred categories
userRoutes.post(
    "/users/preferred-categories",
    isAuthenticated,
    setPreferredCategories
); // DONE
userRoutes.get(
    "/users/preferred-categories",
    isAuthenticated,
    getPreferredCategories
); // DONE
userRoutes.patch(
    "/users/preferred-categories",
    isAuthenticated,
    updatedPreferredCategories
); // DONE

// User can delete his/her account
userRoutes.delete("/users", isAuthenticated, deleteAccount); // DONE

// Anyone can search for users (by name)
userRoutes.get("/users", isLoggedIn, searchForUsers); // DONE
// For getting user profile data (contains followers and following counts)
userRoutes.get("/users/:userId", getUserDetails); // DONE

// Admin can delete user account
userRoutes.delete(
    "/adimn/users/:userId",
    isAuthenticated,
    isAdmin,
    adminDeleteUser
); // DONE
// Admin can browse users
userRoutes.get("/admin/users", isAuthenticated, isAdmin, adminGetUsers); // DONE

module.exports = userRoutes;
