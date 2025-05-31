const { Router } = require("express");
const signin = require("../controllers/auth/signin");
const signup = require("../controllers/auth/signup");
const logout = require("../controllers/auth/logout");
const forgetPassword = require("../controllers/auth/forgetPassword");
const resetPasswordByToken = require("../controllers/auth/resetPasswordByToken");
const resetPassword = require("../controllers/auth/resetPassword");

const downloadProfilePic = require("../middlewares/downloadProfilePic");
const isAuthenticated = require('../middlewares/isAuthenticated');

const authRouter = Router();

authRouter.post("/signin", signin);
authRouter.post("/signup", downloadProfilePic, signup);
// The user must be logged in to be able to logout
authRouter.get("/logout", isAuthenticated, logout);

authRouter.get("/forget-password", forgetPassword);

// The user can reset the password when he is logged in
authRouter.post("/reset-password/:tokenId", resetPasswordByToken);

// The user can change his password
authRouter.post("/reset-password", isAuthenticated, resetPassword);

module.exports = authRouter;
