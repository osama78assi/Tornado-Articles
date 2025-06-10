import { randomUUID } from "crypto";
import { Request, Response } from "express";
import { decode, JsonWebTokenError, sign, verify } from "jsonwebtoken";
import { del, exists, set } from "../../../config/redisConfig";
import tokenReqsLogger from "../../../loggers/tokenReqsLogger";
import OperationError from "../../../util/operationError";

class ErrorsEnum {
    static MISSING_REFRESH_TOKEN = new OperationError(
        "No refresh token provided. Please login again",
        401,
        "NO_REFRESH_TOKEN"
    );

    static INVALID_REFRESH_TOKEN = new OperationError(
        "Invalid refresh token. Please login again",
        401,
        "INVALID_REFRESH_TOKEN"
    );
}

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function generateAccessToken(req, res, next) {
    try {
        // Must get the refresh token from the user. VIA httpOnly cookie
        const refreshToken = req.cookies?.refreshToken || null;
        if (refreshToken === null)
            return next(ErrorsEnum.MISSING_REFRESH_TOKEN);

        // Verify the token before takeing any action
        verify(refreshToken, process.env.REFRESH_SECRET_STRING);

        // Decode the token and extract jti
        const { jti: oldJti, id, exp: expireAt } = decode(refreshToken);
        const ip = req.ip;

        // Throw a not valid token. and save that jti but this is first time.
        if (
            !(await exists(`refresh:${oldJti}`)) &&
            !(await exists(`refresh-uncommon:${ip}-${id}`))
        ) {
            // Either someone is trying to attack the user by sending fake jti (but valid refresh token). or it's maybe the user but his/her session is end
            await set(
                `refresh-uncommon:${ip}-${id}`,
                ip,
                "EX",
                process.env.ACCESS_TOKEN_LIFE_TIME + 300
            ); // Cach it for normal time to ask for access token + 5 min

            // log it
            tokenReqsLogger(id, ip, new Date().toISOString(), true); // pass it as first time

            return next(ErrorsEnum.INVALID_REFRESH_TOKEN); // Normal message really
        }

        // Wrong jti but the same ip and user
        if (
            !(await exists(`refresh:${oldJti}`)) &&
            (await exists(`refresh-uncommon:${ip}-${id}`))
        ) {
            // TODO: add that ip to black list
            // log it
            tokenReqsLogger(id, ip, new Date().toISOString(), false);
            return next(ErrorsEnum.INVALID_REFRESH_TOKEN);
        }

        // If we are here. we (should be at least) safe
        const newJti = randomUUID();
        // get new refresh token & jti
        const newRefreshToken = sign(
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
        const accessToken = sign({ id }, process.env.ACCESS_SECRET_STRING, {
            expiresIn: +process.env.ACCESS_TOKEN_LIFE_TIME, // 15min
        });

        // Delete the old one in the redis and cache the new jti
        await del(`refresh:${oldJti}`);

        const remainTime = expireAt * 1000 - Date.now(); // Remember time to live

        // Set the new value
        await set(`refresh:${newJti}`, id, "EX", remainTime);

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
        if (err instanceof JsonWebTokenError)
            return next(ErrorsEnum.INVALID_REFRESH_TOKEN);
        next(err);
    }
}

export default generateAccessToken;
