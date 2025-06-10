import { Request, Response } from "express";
import UserService from "../dbServices/userService";
import OperationError from "../util/operationError";

/**
 *
 * This middleware should be called after authintacion middleware
 * @param {Request} req
 * @param {Response} res
 */
async function isAdmin(req, res, next) {
    try {
        const id = req.userInfo.id;

        // Get the id
        const user = await UserService.getUserById(id);

        if (user.dataValues.role === "user") {
            return next(new OperationError("You aren't admin man !", 401));
        }
        // Pass to next middelware
        next();
    } catch (err) {
        next(err);
    }
}

export default isAdmin;
