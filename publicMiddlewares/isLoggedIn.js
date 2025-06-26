import jwt from "jsonwebtoken";
import TornadoUserService from "../src/tornadoUser/services/tornadoUserService.js";
import APIError from "../util/APIError.js";

class ErrorsEnum {
    static INVALID_TOKEN = new APIError(
        "Invalid token. Please login again before requesting",
        401,
        "error"
    );

    static EXPIRED_TOKEN = new APIError(
        "Token has expired. Please login again before requesting",
        401
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

        // Check if user exists
        const user = await TornadoUserService.getUserById(payload?.id);

        if (
            user.dataValues.passwordChangeAt !== null &&
            user.dataValues.passwordChangeAt > new Date(payload.iat * 1000)
        ) {
            return next(
                new APIError(
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
            next(ErrorsEnum.EXPIRED_TOKEN);
        } else if (err instanceof jwt.JsonWebTokenError) {
            next(ErrorsEnum.INVALID_TOKEN);
        } else {
            next(err);
        }
    }
}

export default isLoggedIn;
