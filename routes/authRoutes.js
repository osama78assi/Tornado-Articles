const { Router } = require("express");
const signin = require("../controllers/auth/signin");
const signup = require("../controllers/auth/signup");
const logout = require("../controllers/auth/logout");
const profilePic = require("../middlewares/downloadProfilePic");
const isAuthenticated = require('../middlewares/isAuthenticated');
const forgetPassword = require("../controllers/auth/forgetPassword");
const resetPasswordByToken = require("../controllers/auth/resetPasswordByToken");

const authRouter = Router();

authRouter.post("/signin", signin);
authRouter.post("/signup", profilePic, signup);
// The user must be logged in to be able to logout
authRouter.get("/logout", isAuthenticated, logout);

authRouter.get("/forget-password", forgetPassword);

// The user can reset the password when he is logged in
authRouter.post("/reset-password/:tokenId", resetPasswordByToken);


module.exports = authRouter;
