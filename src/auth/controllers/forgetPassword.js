import { createHash, randomBytes } from "crypto";
import sendResetPassURL from "../../../services/sendResetPassURL.js";
import APIError from "../../../util/APIError.js";
import AuthUserService from "../services/AuthUserService.js";
import PasswordTokenService from "../services/passwordTokenService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function forgetPassword(req, res, next) {
    let tokenId = null;

    try {
        const { email = null } = req?.query ?? {};

        if (email === null)
            return next(
                new APIError(
                    "Missing email. Please provide the email to reset the password.",
                    400,
                    "EMAIL_NOT_FOUND"
                )
            );

        // Get the user id
        const { id, fullName } = await AuthUserService.getUserBy(email);

        // We will send the token to the user
        const token = randomBytes(32).toString("hex");

        // Hash it and store it in the database
        const hashedToken = createHash("sha256")
            .update(token)
            .digest("base64url");

        // Store the hashed one (to not allow anyone to know it except users)
        ({ tokenId } = await PasswordTokenService.createToken(id, hashedToken));

        // Send the token (without await)
        sendResetPassURL(
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
        // If some error happend for safety delete the token if generated
        await PasswordTokenService.deleteTokenById(tokenId);
        next(err);
    }
}

export default forgetPassword;
