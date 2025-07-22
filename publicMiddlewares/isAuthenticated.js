import jwt from "jsonwebtoken";
import AuthUserService from "../src/auth/services/AuthUserService.js";
import APIError from "../util/APIError.js";

class ErrorsEnum {
    static NO_TOKEN = new APIError(
        "Authentication required. Please log in to access this source",
        401,
        "UNATHUNTICATED"
    );
    static CHANGES_HAPPENED = new APIError(
        "Some changes happened to the user data. The token is no longer valid. Please login again",
        401,
        "USER_DATA_CHANGED"
    );
    static EXPIRED_TOKEN = new APIError(
        "Token has expired. Please send request for new access token.",
        401,
        "ACCESS_TOKEN_EXPIRED"
    );
    static INVALID_TOKEN = new APIError(
        "Invalid token. Please login again before requesting",
        401,
        "INVALID_ACCESS_TOKEN"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function isAuthenticated(req, res, next) {
    const refreshToken = req?.cookies?.refreshToken || null;

    try {
        const token = req?.cookies?.accessToken || null;

        if (token === null && refreshToken === null) {
            return next(ErrorsEnum.NO_TOKEN);
        }

        // Check the refresh to know if it's not really authenticated
        if (token === null && refreshToken !== null) {
            return next(ErrorsEnum.EXPIRED_TOKEN);
        }

        // Verfiy the token
        const payload = jwt.verify(token, process.env.ACCESS_SECRET_STRING);

        // Check if the user is exist in database
        const user = await AuthUserService.getUserProps(
            payload?.id,
            ["id", "role"],
            ["passwordChangedAt", "verifiedEmail"]
        );

        // Check if there is he/she changed password
        // When the date is after the initilize of the token
        if (
            user.limits.passwordChangedAt !== null &&
            user.limits.passwordChangedAt > new Date(payload.iat * 1000)
        ) {
            return next(ErrorsEnum.CHANGES_HAPPENED);
        }

        // Attach the data to use it in another controller
        req.userInfo = {
            id: user.id,
            role: user.role,
            verifiedEmail: user.limits.verifiedEmail,
        };
        return next();
    } catch (err) {
        // When the access token is expired and there is a refresh token
        if (
            err instanceof jwt.TokenExpiredError ||
            (err instanceof jwt.JsonWebTokenError && refreshToken !== null)
        ) {
            next(ErrorsEnum.EXPIRED_TOKEN);
        } else if (
            err instanceof jwt.JsonWebTokenError &&
            refreshToken === null
        ) {
            next(ErrorsEnum.INVALID_TOKEN);
        } else {
            next(err);
        }
    }
}

export default isAuthenticated;
