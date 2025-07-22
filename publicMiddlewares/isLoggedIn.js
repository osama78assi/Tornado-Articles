import jwt from "jsonwebtoken";
import AuthUserService from "../src/auth/services/AuthUserService.js";
import APIError from "../util/APIError.js";

class ErrorsEnum {
    static INVALID_TOKEN = new APIError(
        "Invalid token. Please login again before requesting",
        401,
        "INVALID_ACCESS_TOKEN"
    );

    static EXPIRED_TOKEN = new APIError(
        "Token has expired. Please login again before requesting",
        401,
        "ACCESS_TOKEN_EXPIRED"
    );
}

/**
 *
 * This middleware is just for routes where both guests and users can navigate to.
 *
 * But if user logged in the behavior will be different
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function isLoggedIn(req, res, next) {
    try {
        const token = req.cookies?.accessToken || null;

        if (token === null) {
            // Pass it
            req.isGuest = true;
            return next();
        }

        const payload = jwt.verify(token, process.env.ACCESS_SECRET_STRING);

        // Check if user exists. and save his data
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
        if (err instanceof jwt.TokenExpiredError) {
            // Here you can just pass without error but it's a good practice to tell the user that he is no longer signed in
            next(ErrorsEnum.EXPIRED_TOKEN);
        } else if (err instanceof jwt.JsonWebTokenError) {
            next(ErrorsEnum.INVALID_TOKEN);
        } else {
            next(err);
        }
    }
}

export default isLoggedIn;
