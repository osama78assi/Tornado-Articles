const { Request, Response } = require("express");
const crypto = require("crypto");
const OperationError = require("../../../util/operationError");
const UserService = require("../../../dbServices/userService");
const PasswordTokenservice = require("../../../dbServices/passwordTokenService");
const sendResetPassURL = require("../../../services/sendResetPassURL");

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function forgetPassword(req, res, next) {
    try {
        const { email = null } = req?.query || {};

        if (email === null)
            return next(
                new OperationError(
                    "Missing email. Please provide the email to reset the password.",
                    400
                )
            );

        // Get the user id
        const { id, fullName } = await UserService.getUserForAuth(email);

        // We will send the token to the user
        const token = crypto.randomBytes(32).toString("hex");

        // Hash it and store it in the database
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("base64url");

        // Store the hashed one (to not allow anyone to know it except users)
        await PasswordTokenservice.createToken(id, hashedToken);

        // Send the token
        await sendResetPassURL(
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
