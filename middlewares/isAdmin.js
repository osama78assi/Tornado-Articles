const { Request, Response } = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const OperationError = require("../util/operationError");

/**
 *
 * This middleware should be called after authintacion middleware
 * @param {Request} req
 * @param {Response} res
 */
async function isAdmin(req, res, next) {
    try {
        const token = req.cookies.token;
        const id = req.userInfo.id;

        // Get the id
        const user = await User.getUserById(id);

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
