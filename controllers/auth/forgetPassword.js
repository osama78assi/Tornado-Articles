const { Request, Response } = require("express");
const crypto = require("crypto");
const { hasHook } = require("../../models/category");
const OperationError = require("../../helper/operationError");
const User = require("../../models/user");
const PasswordToken = require("../../models/passwordToken");
const sendResetPassURL = require("../../services/sendResetPassURL");

class ErrorEnum {
    static MISSING_EMAIL = new OperationError(
        "Missing email. Please provide the email to reset the password.",
        400,
    );
}

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function forgetPassword(req, res, next) {
    try {
        const { email } = req?.query || {};

        if (email === undefined) return next(ErrorEnum.MISSING_EMAIL);

        // Get the user id
        const { id, fullName } = await User.getUserForAuth(email);

        // We will send the token to the user
        const token = crypto.randomBytes(32).toString("hex");

        // Hash it and store it in the database
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("base64url");

        // Store the hashed one (to not allow anyone to know it except users)
        await PasswordToken.createToken(id, hashedToken);

        // Send the token
        const info = await sendResetPassURL(
            { userName: fullName, userEmail: email },
            {
                user: process.env.GOOGLE_EMAIL,
                pass: process.env.GOOGLE_APP_PASS,
            },
            token
        );

        return res.status(200).json({
            status: "success",
            message: "Reset password URL sent via email",
        });
    } catch (err) {
        next(err);
    }
}

module.exports = forgetPassword;
