import { Router } from "express";
import forgetPassword from "../controllers/forgetPassword.js";
import logout from "../controllers/logout.js";
import resetPassword from "../controllers/resetPassword.js";
import resetPasswordByToken from "../controllers/resetPasswordByToken.js";
import signin from "../controllers/signin.js";
import signup from "../controllers/signup.js";

import isAuthenticated from "../../../publicMiddlewares/isAuthenticated.js";

import uploadProfilePic from "../../../publicMiddlewares/downloadProfilePic.js";
import isAdmin from "../../../publicMiddlewares/isAdmin.js";
import adminDeleteUser from "../controllers/adminDeleteUser.js";
import deleteAccount from "../controllers/deleteAccount.js";

import measureHandlerTime from "../../../util/measureHandlerTime.js";
import generateAccessToken from "../controllers/generateAccessToken.js";
import validateSession from "../middlewares/validateSession.js";

import getLoggedInDevices from "../controllers/getLoggedInDevices.js";
import logoutFromDevice from "../controllers/logoutFromDevice.js";
import isThereSession from "../middlewares/isThereSession.js";

const authRouter = Router();

authRouter.post("/signin", isThereSession, signin);
authRouter.post("/signup", isThereSession, uploadProfilePic, signup);
// The user must be logged in to be able to logout
authRouter.get("/logout", isAuthenticated, validateSession, logout);

authRouter.get("/forget-password", isThereSession, forgetPassword);

// The user can reset the password when he is logged in
authRouter.post("/reset-password/:tokenId", resetPasswordByToken);

// The user can change his password
authRouter.post(
    "/reset-password",
    isAuthenticated,
    validateSession,
    measureHandlerTime(resetPassword, "Reset password")
);

// User can delete his/her account. With these middlewares we make sure that the user should have both tokens valid
authRouter.delete("/users", isAuthenticated, isThereSession, deleteAccount);

// Admin can delete user account
authRouter.delete(
    "/admin/users/:userId",
    isAuthenticated,
    isAdmin,
    adminDeleteUser
);

// To get another access token
authRouter.get("/get-access-token", validateSession, generateAccessToken);

// To see how many devices you are logged in by
authRouter.get(
    "/loggedin-devices",
    isAuthenticated,
    validateSession,
    getLoggedInDevices
);

// Logout from another device
authRouter.delete(
    "/logout-device",
    isAuthenticated,
    validateSession,
    logoutFromDevice
);

export default authRouter;
