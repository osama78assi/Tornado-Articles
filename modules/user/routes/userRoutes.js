const { Router } = require("express");
// Controllers
const changeName = require("../controllers/changeName");
const deleteAccount = require("../controllers/deleteAccount");
const searchForUsers = require("../controllers/searchForUsers");
const followUser = require("../controllers/followUser");
const unfollowUser = require("../controllers/unfollowUser");
const getPreferredCategories = require("../controllers/getPreferredCategories");
const setPreferredCategories = require("../controllers/setPreferredCategories");
const updatedPreferredCategories = require("../controllers/updatePreferredCategories");
const adminDeleteUser = require("../controllers/adminDeleteUser");
const adminGetUsers = require("../controllers/adminGetUsers");
const getUserDetails = require("../controllers/getUserDetails");

// Middlewares
const isAuthenticated = require("../middlewares/isAuthenticated");
const isAdmin = require("../middlewares/isAdmin");
const isLoggedIn = require("../middlewares/isLoggedIn");
const changeProfilePic = require("../controllers/changeProfilePic");
const downloadProfilePic = require("../middlewares/downloadProfilePic");
const deletePofilePic = require("../controllers/deletePofilePic");
const editBrief = require("../controllers/editBrief");
const updateCookiesAccess = require("../controllers/updateCookiesAccess");
const getFollowers = require("../controllers/getFollowers");
const getFollowings = require("../controllers/getFollowings");

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
