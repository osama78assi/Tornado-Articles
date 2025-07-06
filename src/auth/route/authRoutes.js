import { Router } from "express";
import adminDeleteUser from "../controllers/adminDeleteUser.js";
import deleteAccount from "../controllers/deleteAccount.js";
import forgetPassword from "../controllers/forgetPassword.js";
import generateAccessToken from "../controllers/generateAccessToken.js";
import getLoggedInDevices from "../controllers/getLoggedInDevices.js";
import logout from "../controllers/logout.js";
import logoutFromDevice from "../controllers/logoutFromDevice.js";
import resetPassword from "../controllers/resetPassword.js";
import resetPasswordByToken from "../controllers/resetPasswordByToken.js";
import signin from "../controllers/signin.js";
import signup from "../controllers/signup.js";

import downloadProfilePic from "../../../publicMiddlewares/downloadProfilePic.js";
import isAdmin from "../../../publicMiddlewares/isAdmin.js";
import isAuthenticated from "../../../publicMiddlewares/isAuthenticated.js";
import adminCreateAccount from "../controllers/adminCreateAccount.js";
import adminDeleteUserValidate from "../middlewares/adminDeleteUser.validate.js";
import forgetPasswordValidate from "../middlewares/forgetPassword.validate.js";
import isThereSession from "../middlewares/isThereSession.js";
import logoutDeviceValidate from "../middlewares/logoutDevice.validate.js";
import resetPassByTokenValidate from "../middlewares/resetPassByToken.validate.js";
import resetPasswordValidate from "../middlewares/resetPassword.validate.js";
import validateSignin from "../middlewares/signin.validate.js";
import validateSignup from "../middlewares/signup.validate.js";
import validateSession from "../middlewares/validateSession.js";

const authRouter = Router();

authRouter.post("/auth/signin", isThereSession, validateSignin, signin);
authRouter.post(
    "/auth/signup",
    isThereSession,
    validateSignup,
    downloadProfilePic,
    signup
);

// Admin can create accounts
authRouter.post(
    "/admin/auth/users",
    isAuthenticated,
    isAdmin,
    validateSession,
    validateSignup,
    downloadProfilePic,
    adminCreateAccount
);

// The user must be logged in to be able to logout
authRouter.get("/auth/logout", isAuthenticated, validateSession, logout);

// User ask for reset password token
authRouter.post(
    "/auth/forget-password",
    isThereSession,
    forgetPasswordValidate,
    forgetPassword
);

// The user can reset the password when he is logged in
authRouter.put(
    "/auth/reset-password/:tokenId",
    resetPassByTokenValidate,
    resetPasswordByToken
);

// The user can change his password
authRouter.put(
    "/auth/reset-password",
    isAuthenticated,
    validateSession,
    resetPasswordValidate,
    // measureHandlerTime(resetPassword, "Reset password")
    resetPassword
);

// User can delete his/her account. With these middlewares we make sure that the user should have both tokens valid
authRouter.delete(
    "/auth/users",
    isAuthenticated,
    isThereSession,
    deleteAccount
);

// Admin can delete user account
// Used POST becasue there is a body
authRouter.post(
    "/admin/auth/users/:userId",
    isAuthenticated,
    isAdmin,
    adminDeleteUserValidate,
    adminDeleteUser
);

// To get another access token
authRouter.get("/auth/get-access-token", validateSession, generateAccessToken);

// To see how many devices you are logged in by
authRouter.get(
    "/auth/loggedin-devices",
    isAuthenticated,
    validateSession,
    getLoggedInDevices
);

// Logout from another device
authRouter.delete(
    "/auth/logout-device",
    isAuthenticated,
    validateSession,
    logoutDeviceValidate,
    logoutFromDevice
);

export default authRouter;
