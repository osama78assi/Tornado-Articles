const { Request, Response } = require("express");
const OperationError = require("../../../util/operationError");
const UserService = require("../../../dbServices/userService");
const jwt = require("jsonwebtoken");
const fs = require("fs/promises");
const path = require("path");
const sanitize = require("../../../util/sanitize");
const redis = require("../../../config/redisConfig");
const crypto = require("crypto");
const testAuth = require("../../../loggers/testingAuth");

// Just for more readability
class ErrorsEnum {
    static NAME_MISSING = new OperationError(
        "The name is required field.",
        400
    );
    static EMAIL_MISSING = new OperationError(
        "The email is required field.",
        400
    );
    static PASSWORD_MISSING = new OperationError(
        "The Password is required field",
        400
    );
    static BIRTH_DATE_MISSING = new OperationError(
        "The birth date is required field",
        400
    );
    static GENDER_MISSING = new OperationError(
        "The gender is required field.",
        400
    );
}

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function signup(req, res, next) {
    try {
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
        } = req?.body || {};

        // Some validation
        if (fullName === null) return next(ErrorsEnum.NAME_MISSING);
        if (email === null) return next(ErrorsEnum.EMAIL_MISSING);
        if (password === null) return next(ErrorsEnum.PASSWORD_MISSING);
        if (birthDate === null) return next(ErrorsEnum.BIRTH_DATE_MISSING);
        if (gender === null) return next(ErrorsEnum.GENDER_MISSING);

        const user = await UserService.createUser(
            fullName,
            email,
            password,
            birthDate,
            gender,
            profilePicName,
            "user"
        );

        // Sign in directly
        const jti = crypto.randomUUID(); // Json Token ID
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

        // Cache the refresh token to auto-reuse-detction
        redis.set(
            `refresh:${jti}`,
            user.dataValues.id,
            "EX",
            +process.env.REFRESH_TOKEN_LIFE_TIME
        ); // pass TTL is the time to live for the token

        // For testing
        testAuth("signup", jti, user.dataValues.id, refreshToken);

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
            "changeDate",
            "role",
            "createdAt",
            "updatedAt",
            "birthDate",
        ]);

        // Send the access token via data
        res.status(200).json({
            status: "success",
            data: user,
        });
    } catch (err) {
        // When there is an error the user might uploaded a profile picture
        if (req?.file?.filename) {
            await fs.unlink(
                path.join(
                    __dirname,
                    "../../uploads/profilePics",
                    req?.file?.filename
                ),
                function (err) {
                    if (err) {
                        throw err;
                    }
                }
            );
        }

        next(err);
    }
}

module.exports = signup;
