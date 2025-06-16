import { createHash } from "crypto";
import redis from "../../../config/redisConfig.js";
import APIError from "../../../util/APIError.js";
import AuthUserService from "../services/AuthUserService.js";
import passwordTokenService from "../services/passwordTokenService.js";

class ErrorEnum {
    static MISSING_PASSWORD = new APIError(
        "Please provide the new password",
        400,
        "MISSING_DATA"
    );

    static EXPIRED_TOKEN = new APIError(
        "The URL is expired. You are no longer can update your password by this URL. Ask for another.",
        410,
        "EXPIRED_URL"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function resetPasswordByToken(req, res, next) {
    try {
        const { tokenId } = req?.params || {};
        const { newPassword = null } = req?.body || {};

        if (newPassword === null || newPassword === "")
            return next(ErrorEnum.MISSING_PASSWORD);

        // Hash it
        const hashedTokenId = createHash("sha256")
            .update(tokenId)
            .digest("base64url");

        // Check for it
        const passwordToken = await passwordTokenService.getTokenById(
            hashedTokenId
        );

        // Check for validation
        if (new Date(passwordToken.dataValues.expiresAt) < new Date())
            return next(ErrorEnum.EXPIRED_TOKEN);

        let userId = passwordToken.dataValues.userId;

        // Here the token is valid and existed. update the password
        await AuthUserService.updateUserPassword(userId, newPassword);

        // If the new password isn't valid the code here isn't reachable
        await passwordTokenService.deleteTokenById(hashedTokenId);

        // Invalid all the sessions if exists for this user
        if (await redis.exists(`loggedin:${userId}`)) {
            const JTIs = await redis.lrange(`loggedin:${userId}`, 0, -1);

            JTIs.forEach((jti, i) => {
                JTIs[i] = `refresh:${jti}`;
            })

            await redis.del(...JTIs, `loggedin:${userId}`);
        }

        return res.status(200).json({
            success: true,
            message: "You can login with your new password",
        });
    } catch (err) {
        next(err);
    }
}

export default resetPasswordByToken;
