const { Request, Response } = require("express");
const UserService = require("../../../dbServices/userService");
const bcrypt = require("bcryptjs");
const OperationError = require("../../../util/operationError");

class ErrorEnum {
    static INCORRECT_PASSWORD = new OperationError(
        "The password isn't correct.",
        400
    );

    static MISSING_DATA = new OperationError(
        "Please provide both old password and new password",
        400
    );

    static SAME_PASSWORD = new OperationError(
        "The new password is the same as old. Please choose another one",
        400
    );
}

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function resetPassword(req, res, next) {
    try {
        const { oldPassword = null, newPassword = null } = req?.body || {};

        if (oldPassword === null || newPassword === null)
            return next(ErrorEnum.MISSING_DATA);

        // The user should be logged in
        const userId = req.userInfo.id;

        const user = await UserService.getUserForAuth(userId, false);

        const isCorrect = await bcrypt.compare(
            oldPassword,
            user.dataValues.password
        );

        if (!isCorrect) return next(ErrorEnum.INCORRECT_PASSWORD);

        // Check if the password is the same
        if (await bcrypt.compare(newPassword, user.dataValues.password))
            return next(ErrorEnum.SAME_PASSWORD);

        await UserService.updateUserPassword(userId, newPassword);

        // Logout the user
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
        });

        return res.status(200).json({
            status: "error",
            message:
                "Password changed successfully. Please login in your new password",
        });
    } catch (err) {
        next(err);
    }
}

module.exports = resetPassword;
