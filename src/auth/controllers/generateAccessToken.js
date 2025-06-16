import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import redis from "../../../config/redisConfig.js";


/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function generateAccessToken(req, res, next) {
    try {
        // This will be from validate session
        const {id, jti: oldJti, expireAt} = req.userSession;

        // If we are here. we (should be at least) safe
        const newJti = randomUUID();
        // get new refresh token & jti
        const newRefreshToken = jwt.sign(
            {
                id,
                jti: newJti,
            },
            process.env.REFRESH_SECRET_STRING,
            {
                expiresIn: expireAt, /// Keep the same expire at
            }
        );

        // Get the new access token
        const accessToken = jwt.sign({ id }, process.env.ACCESS_SECRET_STRING, {
            expiresIn: +process.env.ACCESS_TOKEN_LIFE_TIME, // 15min
        });

        // Delete the old one in the redis and cache the new jti
        await redis.del(`refresh:${oldJti}`);

        const remainTime = expireAt * 1000 - Date.now(); // Remember time to live

        // Set the new value
        await redis.set(`refresh:${newJti}`, `deviceType=${req.device.type}`, "EX", remainTime);

        // Set the refresh in httpOnly cookie
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            maxAge: remainTime * 1000,
            // secure: true, // For production to only transfer with HTTPS protocol
        });

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            maxAge: +process.env.ACCESS_TOKEN_LIFE_TIME * 1000,
            // secure: true,
        });

        res.status(200).json({
            success: true,
            message: "New access token granted",
        });
    } catch (err) {
        next(err);
    }
}

export default generateAccessToken;
