import { createHash } from "crypto";
import {
    GENERATE_EMAIL_CODES_LIMITS,
    EMAIL_CODES_ALLOWED_COUNTS as LIMIT_COUNTS,
} from "../../../config/settings.js";
import sendVerifyEmailCode from "../../../services/sendVerifyEmailCode.js";
import APIError from "../../../util/APIError.js";
import generateDateAfter from "../../../util/generateDateAfter.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import AuthUserService from "../services/AuthUserService.js";
import EmailTokenService from "../services/EmailTokenService.js";
import { generateCode } from "../util/index.js";

class ErrorsEnum {
    static EMAIL_VERIFICATION_LIMIT = (canRequestAt) =>
        new APIError(
            "You can't more for email verification code",
            429,
            "EMAIL_VERIFICATION_LIMIT",
            [["canRequestAt", canRequestAt]]
        );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function askVerifyEmail(req, res, next) {
    try {
        // Here is the only usecase so no need for another middleware
        const { verifiedEmail, id } = req?.userInfo;

        if (verifiedEmail) return next(GlobalErrorsEnum.EMAIL_ALREADY_VERIFIED);

        const {
            email,
            fullName,
            limits: { canVerifyEmailAt },
        } = await AuthUserService.getUserProps(
            id,
            ["email", "fullName"],
            ["canVerifyEmailAt"]
        );

        if (
            canVerifyEmailAt !== null &&
            new Date(canVerifyEmailAt) > new Date()
        )
            return next(ErrorsEnum.EMAIL_VERIFICATION_LIMIT(canVerifyEmailAt));

        // Check if there is about 'five' valid tokens then ignore the request
        const count = await EmailTokenService.getValidTokenCounts(id);

        // To know which time he blocked by
        let blockedTimeIndex = 0;

        // To reduce if conditions
        // like (5 => 0), (5 => 1)
        const blockMap = new Map([
            [LIMIT_COUNTS, 0],
            [LIMIT_COUNTS + 1, 1],
            [LIMIT_COUNTS + 2, 2],
            [LIMIT_COUNTS + 3, 3],
        ]);

        // The last request is the (5)th request in my settings. if bigger than limit take last element
        blockedTimeIndex =
            blockMap.get(count) ??
            (count > 7 ? blockMap.get(LIMIT_COUNTS + 3) : 0); // bigger then block maximum then block duration again

        // Now update the limits
        await EmailTokenService.banGenerateEmailCodeTill(
            id,
            generateDateAfter(GENERATE_EMAIL_CODES_LIMITS[blockedTimeIndex])
        );

        // The email code is a combination of 8 numbers
        const code = generateCode(8);

        // Hash it
        const hashedCode = createHash("sha256")
            .update(code.join(""))
            .digest("base64url");

        // Invalid all tokens
        EmailTokenService.invalidAllTokens(id);

        // Store it in DB and send the plain in email
        await EmailTokenService.createToken(id, hashedCode);

        sendVerifyEmailCode(
            {
                userEmail: email,
                userName: fullName,
            },
            {
                user: process.env.GOOGLE_EMAIL,
                pass: process.env.GOOGLE_APP_PASS,
            },
            code
        );

        return res.status(200).json({
            success: true,
            message: "Verification code sent via email successfully",
        });
    } catch (err) {
        next(err);
    }
}

export default askVerifyEmail;
