const { Request, Response } = require("express");
const PasswordToken = require("../../models/passwordToken");
const crypto = require("crypto");
const OperationError = require("../../util/operationError");
const UserService = require("../../dbServices/userService");

class ErrorEnum {
    static MISSING_PASSWORD = new OperationError(
        "Please provide the new password",
        400
    );

    static EXPIRED_TOKEN = new OperationError(
        "The URL is expired. You are no longer can update your password by this URL. Ask for another.",
        410
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
        const hashedTokenId = crypto
            .createHash("sha256")
            .update(tokenId)
            .digest("base64url");

        // Check for it
        const passwordToken = await PasswordToken.getTokenById(hashedTokenId);

        // Check for validation
        if (new Date(passwordToken.dataValues.expiresAt) < new Date())
            return next(ErrorEnum.EXPIRED_TOKEN);

        // Here the token is valid and existed. update the password
        await UserService.updateUserPassword(
            passwordToken.dataValues.userId,
            newPassword
        );

        // If the new password isn't valid the code here isn't reachable
        await PasswordToken.deleteTokenById(hashedTokenId);

        return res.status(200).json({
            status: "success",
            message: "You can login with your new password",
        });
    } catch (err) {
        next(err);
    }
}

module.exports = resetPasswordByToken;
