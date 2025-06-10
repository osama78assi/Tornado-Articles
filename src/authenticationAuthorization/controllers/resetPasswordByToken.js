import { createHash } from "crypto";
import { Request, Response } from "express";
import OperationError from "../../../util/operationError";
import AuthUserService from "../services/AuthUserService";
import passwordTokenService from "../services/passwordTokenService";

class ErrorEnum {
    static MISSING_PASSWORD = new OperationError(
        "Please provide the new password",
        400,
        "MISSING_DATA"
    );

    static EXPIRED_TOKEN = new OperationError(
        "The URL is expired. You are no longer can update your password by this URL. Ask for another.",
        410,
        "EXPIRED_URL"
    );
}

/**
 *
 * @param {Request} req
 * @param {Response} res
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

        // Here the token is valid and existed. update the password
        await AuthUserService.updateUserPassword(
            passwordToken.dataValues.userId,
            newPassword
        );

        // If the new password isn't valid the code here isn't reachable
        await passwordTokenService.deleteTokenById(hashedTokenId);

        return res.status(200).json({
            success: true,
            message: "You can login with your new password",
        });
    } catch (err) {
        next(err);
    }
}

export default resetPasswordByToken;
