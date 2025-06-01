const { Request, Response } = require("express");
const OperationError = require("../util/operationError");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function isAuthenticated(req, res, next) {
    try {
        if (!req.cookies?.token) {
            return next(
                new OperationError(
                    "Authentication required. Please log in to access this source",
                    401
                )
            );
        }

        // Verfiy the token
        const payload = jwt.verify(
            req.cookies.token,
            process.env.SECRET_STRING
        );

        // Check if the user is exist in database
        const user = await User.getUserById(payload?.id);

        // Check if there is something changed (Password or email)
        // When the date is after the initilize of the token
        if (user.dataValues.changeDate > new Date(payload.iat * 1000)) {
            return next(
                new OperationError(
                    "Some changes happened to the user data. The token is no longer valid. Please login again",
                    401
                )
            );
        }

        // Attach the data to use it in another controller
        req.userInfo = {
            id: user.id,
            role: user.role,
        };
        return next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
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
                    401
                )
            );
        } else {
            next(err);
        }
    }
}

module.exports = isAuthenticated;
