const { Router } = require("express");
const signin = require("../controllers/signin");
const signup = require("../controllers/signup");
const logout = require("../controllers/logout");
const forgetPassword = require("../controllers/forgetPassword");
const resetPasswordByToken = require("../controllers/resetPasswordByToken");
const resetPassword = require("../controllers/resetPassword");

const isAuthenticated = require('../../../publicMiddlewares/isAuthenticated');

const authRouter = Router();

authRouter.post("/signin", signin);
authRouter.post("/signup", signup);
// The user must be logged in to be able to logout
authRouter.get("/logout", isAuthenticated, logout);

authRouter.get("/forget-password", forgetPassword);

// The user can reset the password when he is logged in
authRouter.post("/reset-password/:tokenId", resetPasswordByToken);

// The user can change his password
authRouter.post("/reset-password", isAuthenticated, resetPassword);

module.exports = authRouter;
