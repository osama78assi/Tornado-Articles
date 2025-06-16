import jwt from "jsonwebtoken";
import redis from "../../../config/redisConfig.js";
import APIError from "../../../util/APIError.js";

class ErrorsEnum {
    static MISSING_REFRESH_TOKEN = new APIError(
        "You aren't logged in.",
        401,
        "NOT_LOGGED_IN"
    );

    static INVALID_REFRESH_TOKEN = new APIError(
        "Invalid refresh token. Please login again",
        401,
        "INVALID_REFRESH_TOKEN"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function logout(req, res, next) {
    try {
        const { id } = req.userInfo;
        const { jti } = req.userSession;

        // If we are here then it must be existed. Invalid the session
        await redis.del(`refresh:${jti}`);

        // Now delete the device also
        await redis.lrem(`loggedin:${id}`, 1, jti);

        // To logout we just need to remove the tokens
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: true,
        });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
        });

        return res.status(200).json({
            success: true,
            message: "Logout successfully.",
        });
    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError)
            return next(ErrorsEnum.INVALID_REFRESH_TOKEN);
        next(err);
    }
}

export default logout;
