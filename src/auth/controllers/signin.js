import { compare } from "bcryptjs";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import validator from "validator";
import redis from "../../../config/redisConfig.js";
import APIError from "../../../util/APIError.js";
import sanitize from "../../../util/sanitize.js";
import AuthUserService from "../services/AuthUserService.js";

class ErrorsEnum {
    static EMIAL_MISSING = new APIError(
        "The email is required field.",
        400,
        "MISSING_EMAIL"
    );

    static PASSWORD_MISSING = new APIError(
        "The password is required field.",
        400,
        "MISSING_PASSWORD"
    );

    static INVALID_EMAIL = new APIError(
        "Email isn't valid",
        400,
        "INVALID_EMAIL"
    );

    static INCORRECT_PASSWORD = new APIError(
        "The password isn't correct.",
        400,
        "INCORRECT_PASSWORD"
    );

    static ALREADY_SIGNEDIN = new APIError(
        "You've already signed in.",
        400,
        "ALREADY_SIGNEDIN"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function signin(req, res, next) {
    let jti = null; // To delete it when
    let isAdded = false; // To know if the loggedin device is added to redis
    let userId = null;

    try {
        let { email = null, password = null } = req?.body || {};

        // Some validation
        if (email === null) return next(ErrorsEnum.EMIAL_MISSING);
        if (password === null) return next(ErrorsEnum.PASSWORD_MISSING);

        // For now we don't have devices. So let's just check the current session if there is. Don't create
        let oldRefreshToken = req?.cookies?.refreshToken || null;
        if (oldRefreshToken !== null) {
            // Check the session in the server
            const { jti } = jwt.decode(oldRefreshToken);
            if (await redis.exists(`refresh:${jti}`))
                return next(ErrorsEnum.ALREADY_SIGNEDIN);
        }

        // Check the validation of the email
        if (!validator.isEmail(email)) return next(ErrorsEnum.INVALID_EMAIL);

        const user = await AuthUserService.getUserBy(email);

        userId = user.dataValues.id;

        const isCorrect = await compare(password, user.dataValues.password);

        if (!isCorrect) return next(ErrorsEnum.INCORRECT_PASSWORD);

        // Json Token id
        jti = randomUUID();

        // Generate a refresh token
        const refreshToken = jwt.sign(
            {
                id: userId,
                jti,
            },
            process.env.REFRESH_SECRET_STRING,
            {
                expiresIn: +process.env.REFRESH_TOKEN_LIFE_TIME, // (30 days)
            }
        );

        // Let's add the index to the key to make deleteing easier and make it unique
        let deviceIndex = 0;
        if(await redis.exists(`loggedin:${userId}`)) {
            // Change it to the length if exists
            deviceIndex = await redis.llen(`loggedin:${userId}`);
        }

        // Cache the refresh token for auto-reuse-detction
        await redis.set(
            `refresh:${jti}`,
            `deviceType=${req.device.type}-${deviceIndex}`,
            "EX",
            +process.env.REFRESH_TOKEN_LIFE_TIME
        ); // pass TTL is the time to live for the token

        // Store the logggedin devices for userId
        await redis.rpush(`loggedin:${userId}`, jti);
        // Make sure it's added
        isAdded = true;

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: +process.env.REFRESH_TOKEN_LIFE_TIME * 1000, // (ms)
        });

        // Generate access token
        const accessToken = jwt.sign(
            { id: userId },
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

        sanitize(user, ["email"]);

        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (err) {
        // Delete the session if created
        if (await redis.exists(`refresh:${jti}`)) {
            redis.del(`refresh:${jti}`);
        }

        // Remove that device if inserted
        if(isAdded) {
            // Remove the last element in the array 
            await redis.rpop(`loggedin:${userId}`);
        }

        // If the access / refresh token is set on the cookies then delete it
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: true,
        });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
        });

        return next(err);
    }
}

export default signin;
