const { Request, Response } = require("express");
const OperationError = require("../util/operationError");
const jwt = require("jsonwebtoken");
const UserService = require("../dbServices/userService");

class ErrorsEnum {
    static NO_TOKEN = new OperationError(
        "Authentication required. Please log in to access this source",
        401
    );
    static CHANGES_HAPPENED = new OperationError(
        "Some changes happened to the user data. The token is no longer valid. Please login again",
        401
    );
    static EXPIRED_TOKEN = new OperationError(
        "Token has expired. Please request for access token.",
        401
    );
    static INVALID_TOKEN = new OperationError(
        "Invalid token. Please login again before requesting",
        401
    );
    static INALID_HEADER = new OperationError(
        "Header violate standard. the token should be sent with prefix Barrer",
        417 // Expectation Failed
    );
}

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function isAuthenticated(req, res, next) {
    try {
        let authorization = req.get("Authorization");

        if (authorization === undefined) return next(ErrorsEnum.NO_TOKEN);

        // Check if it's Barrer
        const { barrer, token = null } = authorization.split(" ");

        if (barrer !== "Barrer") {
            return next(ErrorsEnum.INALID_HEADER);
        }

        if (token === null) {
            return next(ErrorsEnum.NO_TOKEN);
        }

        // Verfiy the token
        const payload = jwt.verify(
            token,
            process.env.SECRET_STRING
        );

        // Check if the user is exist in database
        const user = await UserService.getUserById(payload?.id);

        // Check if there is something changed (Password or email)
        // When the date is after the initilize of the token
        if (user.dataValues.changeDate > new Date(payload.iat * 1000)) {
            return next(ErrorsEnum.CHANGES_HAPPENED);
        }

        // Attach the data to use it in another controller
        req.userInfo = {
            id: user.id,
            role: user.role,
        };
        return next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            next(ErrorsEnum.EXPIRED_TOKEN);
        } else if (err instanceof jwt.JsonWebTokenError) {
            next(ErrorsEnum.INVALID_TOKEN);
        } else {
            next(err);
        }
    }
}

module.exports = isAuthenticated;
