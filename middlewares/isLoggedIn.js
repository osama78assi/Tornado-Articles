const { Request, Response } = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

/**
 *
 * This middleware is just for routes where both guests and users can navigate to.
 *
 * But if user logged in the behavior will be different
 * @param {Request} req
 * @param {Response} res
 */
async function isLoggedIn(req, res, next) {
    try {
        const token = req.cookies?.token;

        // If not logged in. Just pass
        if (!token) return next();

        const payload = jwt.verify(token, process.env.SECRET_STRING);

        // Check if user exists
        const user = await User.getUserById(payload?.id);

        if (user.dataValues.changeDate > new Date(payload.iat * 1000)) {
            return next(
                new OperationError(
                    "Some changes happened to the user data. The token is no longer valid. Please login again",
                    401
                )
            );
        }

        req.userInfo = {
            id: user.id,
            role: user.role,
        };

        return next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            // Here you can just pass without error but it's a good practice to tell the user that he is no longer signed in
            next(
                new OperationError(
                    "Token has expired. Please login again before requesting",
                    401
                )
            );
        } else if (err instanceof jwt.JsonWebTokenError) {
            next(
                new OperationError(
                    "Invalid token. Please login again before requesting",
                    401,
                    "error"
                )
            );
        } else {
            next(err);
        }
    }
}

module.exports = isLoggedIn;
