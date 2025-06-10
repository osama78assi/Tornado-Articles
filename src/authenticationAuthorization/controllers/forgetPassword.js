import { createHash, randomBytes } from "crypto";
import { Request, Response } from "express";
import sendResetPassURL from "../../../services/sendResetPassURL";
import OperationError from "../../../util/operationError";
import AuthUserService from "../services/AuthUserService";
import PasswordTokenService from "../services/passwordTokenService";

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
                    400,
                    "EMAIL_NOT_FOUND"
                )
            );

        // Get the user id
        const { id, fullName } = await AuthUserService.getUserForAuth(email);

        // We will send the token to the user
        const token = randomBytes(32).toString("hex");

        // Hash it and store it in the database
        const hashedToken = createHash("sha256")
            .update(token)
            .digest("base64url");

        // Store the hashed one (to not allow anyone to know it except users)
        await PasswordTokenService.createToken(id, hashedToken);

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
            success: true,
            message: "Reset password URL sent via email",
        });
    } catch (err) {
        next(err);
    }
}

export default forgetPassword;
