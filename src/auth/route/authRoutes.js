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

authRouter.post("/signin", isThereSession, validateSignin, signin);
authRouter.post(
    "/signup",
    isThereSession,
    validateSignup,
    downloadProfilePic,
    signup
);
// The user must be logged in to be able to logout
authRouter.get("/logout", isAuthenticated, validateSession, logout);

// User ask for reset password token
authRouter.post(
    "/forget-password",
    isThereSession,
    forgetPasswordValidate,
    forgetPassword
);

// The user can reset the password when he is logged in
authRouter.put(
    "/reset-password/:tokenId",
    resetPassByTokenValidate,
    resetPasswordByToken
);

// The user can change his password
authRouter.put(
    "/reset-password",
    isAuthenticated,
    validateSession,
    resetPasswordValidate,
    // measureHandlerTime(resetPassword, "Reset password")
    resetPassword
);

// User can delete his/her account. With these middlewares we make sure that the user should have both tokens valid
authRouter.delete("/users", isAuthenticated, isThereSession, deleteAccount);

// Admin can delete user account
// Used PUT becasue there is a body
authRouter.put(
    "/admin/users/:userId/delete",
    isAuthenticated,
    isAdmin,
    adminDeleteUserValidate,
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
    logoutDeviceValidate,
    logoutFromDevice
);

export default authRouter;
