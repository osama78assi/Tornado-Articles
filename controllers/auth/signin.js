const { Request, Response } = require("express");
const OperationError = require("../../util/operationError");
const UserService = require("../../dbServices/userService");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");

class ErrorsEnum {
    static EMIAL_MISSING = new OperationError(
        "The email is required field.",
        400
    );

    static PASSWORD_MISSING = new OperationError(
        "The password is required field.",
        400
    );

    static INVALID_EMAIL = new OperationError("Email isn't valid", 400);

    static INCORRECT_PASSWORD = new OperationError(
        "The password isn't correct.",
        400
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
        if (!validator.isEmail(email)) return next(ErrorsEnum.INVALID_EMAIL);

        const user = await UserService.getUserForAuth(email);

        const isCorrect = await bcrypt.compare(
            password,
            user.dataValues.password
        );

        if (!isCorrect) return next(ErrorsEnum.INCORRECT_PASSWORD);

        // Generate a token
        const token = jwt.sign(
            {
                id: user.dataValues.id,
            },
            process.env.SECRET_STRING,
            {
                expiresIn: +process.env.TOKEN_LIFE_TIME / 1000,
            }
        );

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: +process.env.TOKEN_LIFE_TIME,
        });

        return res.status(200).json({
            status: "success",
            data: user,
        });
    } catch (err) {
        return next(err);
    }
}

module.exports = signin;
