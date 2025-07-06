import jwt from "jsonwebtoken";
import redis from "../../../config/redisConfig.js";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static ALREADY_LOGGEDIN = new APIError(
        "You've already loggedin. Please logout first.",
        400,
        "LOGGED_IN"
    );
}

/**
 * check the session both refresh token and the user session in the server
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function isThereSession(req, res, next) {
    try {
        const refreshToken = req.cookies?.refreshToken || null;

        // If there is no refresh token then there is no session
        if (refreshToken === null) return next();

        // If there then we gonna check if it's valid
        jwt.verify(refreshToken, process.env.REFRESH_SECRET_STRING);

        // Decode the token and extract jti
        const { jti } = jwt.decode(refreshToken);

        // Throw a not valid token.
        if (!(await redis.exists(`refresh:${jti}`))) {
            throw GlobalErrorsEnum.INVALID_REFRESH_TOKEN;
        }

        // He is logged in
        return next(ErrorsEnum.ALREADY_LOGGEDIN);
    } catch (err) {
        let toPass = null;
        if (err instanceof jwt.JsonWebTokenError) {
            toPass = GlobalErrorsEnum.INVALID_REFRESH_TOKEN;
        } else if (err instanceof jwt.TokenExpiredError) {
            toPass = GlobalErrorsEnum.REFRESH_TOKEN_EXPIRED;
        }

        // Clear the tokens. When the tokens are invalid
        if (toPass === null) {
            res.clearCookie("accessToken", {
                httpOnly: true,
                secure: true,
            });

            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: true,
            });
        } else {
            toPass = err;
        }

        next(toPass);
    }
}

export default isThereSession;
