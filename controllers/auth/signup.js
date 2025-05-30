const { Request, Response } = require("express");
const OperationError = require("../../helper/operationError");
const User = require("../../models/user");
const jwt = require("jsonwebtoken");
const fs = require("fs/promises");
const path = require("path");

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

        let { fullName, email, password, birthDate, gender } = req?.body || {};

        // Some validation
        if (fullName === undefined) return next(ErrorsEnum.NAME_MISSING);
        if (email === undefined) return next(ErrorsEnum.EMAIL_MISSING);
        if (password === undefined) return next(ErrorsEnum.PASSWORD_MISSING);
        if (birthDate === undefined) return next(ErrorsEnum.BIRTH_DATE_MISSING);
        if (gender === undefined) return next(ErrorsEnum.GENDER_MISSING);

        const user = await User.createUser(
            fullName,
            email,
            password,
            birthDate,
            gender,
            profilePicName,
            "user"
        );

        // Sign in directly
        // Divide by 1000 becuase jwt takes time in seconds
        const token = jwt.sign({ id: user.id }, process.env.SECRET_STRING, {
            expiresIn: +process.env.TOKEN_LIFE_TIME / 1000,
        });

        // Set the token in the cookies
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: +process.env.TOKEN_LIFE_TIME,
        });

        // Delete some info
        delete user.dataValues.changeDate;
        delete user.dataValues.role;
        delete user.dataValues.createdAt;
        delete user.dataValues.updatedAt;
        delete user.dataValues.birthDate;

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
