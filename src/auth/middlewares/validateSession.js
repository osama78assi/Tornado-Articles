import jwt from "jsonwebtoken";
import redis from "../../../config/redisConfig.js";
import loggingService from "../../../services/logginnService.js";
import APIError from "../../../util/APIError.js";

class ErrorsEnum {
    static MISSING_REFRESH_TOKEN = new APIError(
        "No refresh token provided. Please login again",
        401,
        "NO_REFRESH_TOKEN"
    );

    static INVALID_REFRESH_TOKEN = new APIError(
        "Invalid refresh token. Please login again",
        401,
        "INVALID_REFRESH_TOKEN"
    );

    static EXPIRED_TOKEN = new APIError(
        "The refresh token is expired. Please login again",
        401
    );
}

/**
 * validated the session by checking both refresh token and the user session in the server
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function validateSession(req, res, next) {
    try {
        // Must get the refresh token from the user. VIA httpOnly cookie
        const refreshToken = req.cookies?.refreshToken || null;
        if (refreshToken === null)
            return next(ErrorsEnum.MISSING_REFRESH_TOKEN);

        // Verify the token before taking any action
        jwt.verify(refreshToken, process.env.REFRESH_SECRET_STRING);

        // Decode the token and extract jti
        const { jti, id, exp: expireAt } = jwt.decode(refreshToken);
        const ip = req.ip;

        // Throw a not valid token. and save that jti but this is first time.
        if (
            !(await redis.exists(`refresh:${jti}`)) &&
            !(await redis.exists(`refresh-uncommon:${ip}-${id}`))
        ) {
            // Either someone is trying to attack the user by sending fake jti (but valid refresh token). or it's maybe the user but his/her session is end
            await redis.set(
                `refresh-uncommon:${ip}-${id}`,
                ip,
                "EX",
                process.env.ACCESS_TOKEN_LIFE_TIME + 300
            ); // Cach it for normal time to ask for access token + 5 min

            // log it
            loggingService.emit("refresh-tokens-log", {
                userId: id,
                ip,
                requestedAt: new Date().toISOString(),
                isFirstTime: true,
            });

            return next(ErrorsEnum.INVALID_REFRESH_TOKEN); // Normal message really
        }

        // Wrong jti but the same ip and user
        if (
            !(await redis.exists(`refresh:${jti}`)) &&
            (await redis.exists(`refresh-uncommon:${ip}-${id}`))
        ) {
            // TODO: if you want add that ip to black list
            // log it
            loggingService.emit("refresh-tokens-log", {
                userId: id,
                ip,
                requestedAt: new Date().toISOString(),
                isFirstTime: false,
            });
            return next(ErrorsEnum.INVALID_REFRESH_TOKEN);
        }

        // If it's valid let's save the user session in the request object and pass to the next middleware
        req.userSession = {
            jti, // in case if you want to invalidate the session
            expireAt, // in case of rotate the refresh token
            id,
        };

        return next();
    } catch (err) {
        let toPass = null;
        if (err instanceof jwt.JsonWebTokenError) {
            toPass = ErrorsEnum.INVALID_REFRESH_TOKEN;
        } else if (err instanceof jwt.TokenExpiredError) {
            toPass = ErrorsEnum.EXPIRED_TOKEN;
        }

        // Clear the tokens
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

        next(err);
    }
}

export default validateSession;
