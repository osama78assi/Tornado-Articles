import { compare } from "bcryptjs";
import { randomUUID } from "crypto";
import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { isEmail } from "validator";
import redis from "../../../config/redisConfig";
import OperationError from "../../../util/operationError";
import AuthUserService from "../services/AuthUserService";

class ErrorsEnum {
    static EMIAL_MISSING = new OperationError(
        "The email is required field.",
        400,
        "MISSING_EMAIL"
    );

    static PASSWORD_MISSING = new OperationError(
        "The password is required field.",
        400,
        "MISSING_PASSWORD"
    );

    static INVALID_EMAIL = new OperationError(
        "Email isn't valid",
        400,
        "INVALID_EMAIL"
    );

    static INCORRECT_PASSWORD = new OperationError(
        "The password isn't correct.",
        400,
        "INCORRECT_PASSWORD"
    );
}

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function signin(req, res, next) {
    try {
        let { email = null, password = null } = req?.body || {};

        // Some validation
        if (email === null) return next(ErrorsEnum.EMIAL_MISSING);
        if (password === null) return next(ErrorsEnum.PASSWORD_MISSING);

        // Check the validation of the email
        if (!isEmail(email)) return next(ErrorsEnum.INVALID_EMAIL);

        const user = await AuthUserService.getUserForAuth(email);

        const isCorrect = await compare(password, user.dataValues.password);

        if (!isCorrect) return next(ErrorsEnum.INCORRECT_PASSWORD);

        // Json Token id
        const jti = randomUUID();

        // Generate a refresh token
        const refreshToken = sign(
            {
                id: user.dataValues.id,
                jti,
            },
            process.env.REFRESH_SECRET_STRING,
            {
                expiresIn: +process.env.REFRESH_TOKEN_LIFE_TIME, // (30 days)
            }
        );

        // Cache the refresh token for auto-reuse-detction
        redis.set(
            `refresh:${jti}`,
            user.dataValues.id,
            "PX",
            +process.env.REFRESH_TOKEN_LIFE_TIME
        ); // pass TTL is the time to live for the token

        // For testing
        testAuth("signin", jti, user.dataValues.id, refreshToken);

        res.cookie("token", refreshToken, {
            httpOnly: true,
            maxAge: +process.env.REFRESH_TOKEN_LIFE_TIME * 1000, // (ms)
        });

        // Generate access token
        const accessToken = sign(
            { id: user.dataValues.id },
            process.env.ACCESS_SECRET_STRING,
            {
                expiresIn: +process.env.ACCESS_TOKEN_LIFE_TIME, // 15min
            }
        );

        // Send it with httpOnly cookie
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            maxAge: +process.env.ACCESS_TOKEN_LIFE_TIME * 1000,
            // secure: true,
        });

        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (err) {
        return next(err);
    }
}

export default signin;
