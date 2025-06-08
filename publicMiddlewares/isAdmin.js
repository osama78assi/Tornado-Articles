const { Request, Response } = require("express");
const jwt = require("jsonwebtoken");
const UserService = require("../dbServices/userService");
const OperationError = require("../util/operationError");

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

module.exports = isAdmin;
