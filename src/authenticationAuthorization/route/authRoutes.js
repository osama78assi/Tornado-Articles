import { Router } from "express";
import signin from "../controllers/signin";
import signup from "../controllers/signup";
import logout from "../controllers/logout";
import forgetPassword from "../controllers/forgetPassword";
import resetPasswordByToken from "../controllers/resetPasswordByToken";
import resetPassword from "../controllers/resetPassword";

import isAuthenticated from "../../../publicMiddlewares/isAuthenticated";

import uploadProfilePic from "../middlewares/uploadProfilePic";

const authRouter = Router();

authRouter.post("/signin", signin);
authRouter.post("/signup", uploadProfilePic, signup);
// The user must be logged in to be able to logout
authRouter.get("/logout", isAuthenticated, logout);

authRouter.get("/forget-password", forgetPassword);

// The user can reset the password when he is logged in
authRouter.post("/reset-password/:tokenId", resetPasswordByToken);

// The user can change his password
authRouter.post("/reset-password", isAuthenticated, resetPassword);

export default authRouter;
