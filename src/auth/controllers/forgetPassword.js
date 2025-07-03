import { createHash, randomBytes } from "crypto";
import {
    GENERATE_PASSWORD_TOKENS_LIMITS,
    PASSWORD_TOKEN_ALLOWED_COUNTS as LIMIT_COUNTS,
} from "../../../config/settings.js";
import sendResetPassURL from "../../../services/sendResetPassURL.js";
import APIError from "../../../util/APIError.js";
import generateDateAfter from "../../../util/generateDateAfter.js";
import AuthUserService from "../services/AuthUserService.js";
import PasswordTokenService from "../services/passwordTokenService.js";

class ErrorsEnum {
    static FORGET_PASS_LIMIT = (till) =>
        new APIError(
            "You can't generate more tokens",
            429,
            "FORGET_PASS_LIMIT",
            [["canRequestAt", till]]
        );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function forgetPassword(req, res, next) {
    let tokenId = null;

    try {
        const { userEmail } = req?.body;

        // Get the user id
        const {
            id: userId,
            fullName,
            canGenForgetPassAt,
        } = await AuthUserService.getUserBy(userEmail);

        // Reject if the user is blocked from making this action
        if (
            canGenForgetPassAt !== null &&
            new Date(canGenForgetPassAt) > new Date()
        )
            return next(ErrorsEnum.FORGET_PASS_LIMIT(canGenForgetPassAt));

        // Check if there is about 'five' valid tokens then ignore the request
        const count = await PasswordTokenService.getValidTokenCounts(userId);

        // To know which time he blocked by
        let blockedTimeIndex = 0;
        // To reduce if conditions
        const blockMap = new Map([
            [LIMIT_COUNTS, 0],
            [LIMIT_COUNTS + 1, 1],
            [LIMIT_COUNTS + 2, 2],
            [LIMIT_COUNTS + 3, 3],
        ]);

        // The last request is the (5)th request in my settings. if bigger than limit take last element
        blockedTimeIndex =
            blockMap.get(count) ??
            (count > 7 ? blockMap.get(LIMIT_COUNTS + 3) : 0);

        // Now update
        await AuthUserService.banGenPassTokenBy(
            userId,
            generateDateAfter(GENERATE_PASSWORD_TOKENS_LIMITS[blockedTimeIndex])
        );

        // We will send the token to the user
        const token = randomBytes(32).toString("hex");

        console.log("\n\n###########", token, "\n\n###########");

        // Hash it and store it in the database
        const hashedToken = createHash("sha256")
            .update(token)
            .digest("base64url");

        // Invalid old tokens (in background)
        PasswordTokenService.invalidateTokens(userId);

        // Store the hashed one (to not allow anyone to know it except users)
        ({ tokenId } = await PasswordTokenService.createToken(
            userId,
            hashedToken
        ));

        // Send the token (in background)
        sendResetPassURL(
            { userName: fullName, userEmail: userEmail },
            {
                user: process.env.GOOGLE_EMAIL,
                pass: process.env.GOOGLE_APP_PASS,
            },
            token
        );

        return res.status(200).json({
            success: true,
            message: "Reset password URL sent via email",
            requestAfter: GENERATE_PASSWORD_TOKENS_LIMITS[blockedTimeIndex],
        });
    } catch (err) {
        // If some error happend for safety delete the token if generated (may not happen)
        await PasswordTokenService.deleteTokensById(tokenId);
        next(err);
    }
}

export default forgetPassword;
