import { createHash } from "crypto";
import APIError from "../../../util/APIError.js";
import AuthUserService from "../services/AuthUserService.js";
import EmailTokenService from "../services/EmailTokenService.js";

class ErrorsEnum {
    static EXPIRED_TOKEN = new APIError(
        "The code is expired. Please ask for another",
        410,
        "EXPIRED_CODE"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function verifyEmail(req, res, next) {
    try {
        const { code } = req?.body;
        const { id } = req?.userInfo;

        // Hash the code
        const token = createHash("sha256")
            .update(String(code))
            .digest("base64url");

        // Check the code
        const tokenData = await EmailTokenService.getToken(token);

        // Check if it's expired
        if (new Date(tokenData.dataValues.expiresAt) < new Date())
            return next(ErrorsEnum.EXPIRED_TOKEN);

        // Check if the code is the same

        // Verify account
        await AuthUserService.verifyEmail(id);

        // Delete all tokens
        EmailTokenService.destoryTokens(id);

        return res.status(200).json({
            success: true,
            message:
                "You've successfully verified your email. And now you are a Tornado User. Have fun in the middle of the Tornado now",
        });
    } catch (err) {
        next(err);
    }
}

export default verifyEmail;
