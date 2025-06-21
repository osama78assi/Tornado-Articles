import { randomUUID } from "crypto";
import { unlink } from "fs/promises";
import jwt from "jsonwebtoken";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import redis from "../../../config/redisConfig.js";
import APIError from "../../../util/APIError.js";
import sanitize from "../../../util/sanitize.js";
import AuthUserService from "../services/AuthUserService.js";

// Just for more readability
class ErrorsEnum {
    static NAME_MISSING = new APIError(
        "The name is required field.",
        400,
        "MISSING_NAME"
    );
    static EMAIL_MISSING = new APIError(
        "The email is required field.",
        400,
        "MISSING_EMAIL"
    );
    static PASSWORD_MISSING = new APIError(
        "The Password is required field",
        400,
        "MISSING_PASSWORD"
    );
    static BIRTH_DATE_MISSING = new APIError(
        "The birth date is required field",
        400,
        "MISSING_BIRTH_DATE"
    );
    static GENDER_MISSING = new APIError(
        "The gender is required field.",
        400,
        "MISSING_GENDER"
    );
    static SIGNEDIN_CANT_SIGNUP = new APIError(
        "Your are aleardy logged in using another account. Logout to be able to signup with new account",
        400,
        "SIGNEDIN_CANT_SIGNUP"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function signup(req, res, next) {
    let jti = null; // To remove it from the redis if there is some error
    let userId = null; // To drop the record if something happened
    let isAdded = false; // To know if the device is added to loggedin devices

    try {
        // Before doing anything if the user is authenticated from the used device THROW ERROR
        if (req?.userSession?.jti) {
            return next(ErrorsEnum.SIGNEDIN_CANT_SIGNUP);
        }

        // Get the name of the file (added by multer)
        let profilePicName = req?.file?.filename;

        // Build a URL
        if (profilePicName) {
            const protocol = req.protocol;
            const host = req.get("host");
            profilePicName = `${protocol}://${host}/uploads/profilePics/${profilePicName}`;
        }

        let {
            fullName = null,
            email = null,
            password = null,
            birthDate = null,
            gender = null,
        } = req?.body ?? {};

        // Some validation
        if (fullName === null) return next(ErrorsEnum.NAME_MISSING);
        if (email === null) return next(ErrorsEnum.EMAIL_MISSING);
        if (password === null) return next(ErrorsEnum.PASSWORD_MISSING);
        if (birthDate === null) return next(ErrorsEnum.BIRTH_DATE_MISSING);
        if (gender === null) return next(ErrorsEnum.GENDER_MISSING);

        const user = await AuthUserService.createUser(
            fullName,
            email,
            password,
            birthDate,
            gender,
            profilePicName,
            "user"
        );

        // Save the id
        userId = user.dataValues.id;

        // Sign in directly
        jti = randomUUID(); // Json Token ID
        const refreshToken = jwt.sign(
            {
                id: user.id,
                jti,
            },
            process.env.REFRESH_SECRET_STRING,
            {
                expiresIn: +process.env.REFRESH_TOKEN_LIFE_TIME, // (30 day)
            }
        );

        // Set the refresh token in the cookies
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: +process.env.REFRESH_TOKEN_LIFE_TIME * 1000, // (ms)
            // secure: true,
        });

        // Let's add the index to the key to make deleteing easier and make it unique
        let deviceIndex = 0;
        if (await redis.exists(`loggedin:${userId}`)) {
            // Change it to the length if exists
            deviceIndex = await redis.llen(`loggedin:${userId}`);
        }

        // Cache the refresh token to auto-reuse-detction
        await redis.set(
            `refresh:${jti}`,
            `deviceType=${req.device.type}-${deviceIndex}`,
            "EX",
            +process.env.REFRESH_TOKEN_LIFE_TIME
        ); // pass TTL is the time to live for the token

        // Add the device
        await redis.rpush(`loggedin:${user.dataValues.id}`, jti);
        isAdded = true;

        // Generate the access token
        const accessToken = jwt.sign(
            { id: user.dataValues.id },
            process.env.ACCESS_SECRET_STRING,
            {
                expiresIn: +process.env.ACCESS_TOKEN_LIFE_TIME, // 15min
            }
        );

        // Save it in httpOnly cookie
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            maxAge: +process.env.ACCESS_TOKEN_LIFE_TIME * 1000,
            // secure: true,
        });

        // Delete some info
        sanitize(user, [
            "role",
            "createdAt",
            "updatedAt",
            "email",
            "allowCookies",
        ]);

        // Send the access token via data
        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (err) {
        const __dirname = dirname(fileURLToPath(import.meta.url));
        // When there is an error the user might uploaded a profile picture
        if (req?.file?.filename) {
            await unlink(
                join(
                    __dirname,
                    "../../../uploads/profilePics",
                    req?.file?.filename
                ),
                function (err) {
                    if (err) {
                        throw err;
                    }
                }
            );
        }

        // Clear the token from the session when there is any error
        if (await redis.exists(`refresh:${jti}`)) {
            await redis.del(`refresh:${jti}`);
        }

        // Dorp the record if created
        if (userId !== null) {
            await AuthUserService.deleteUser(userId);
        }

        // Remove the item if added
        if (isAdded && userId !== null) {
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

        next(err);
    }
}

export default signup;
