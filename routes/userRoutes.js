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
const getFollowers = require("../controllers/user/getFollowers");
const getFollowings = require("../controllers/user/getFollowings");

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

module.exports = userRoutes;
