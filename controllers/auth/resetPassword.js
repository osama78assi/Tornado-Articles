const { Request, Response } = require("express");
const User = require("../../models/user");
const bcrypt = require("bcryptjs");

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function resetPassword(req, res, next) {
    try {
        const { oldPassword, newPassword } = req?.body || {};

        // The user should be logged in
        const userId = req.userInfo.id;

        const user = await User.getUserForAuth(userId, false);

        const isCorrect = await bcrypt.compare(
            oldPassword,
            user.dataValues.password
        );

        if (!isCorrect)
            return next(
                new OperationError("The password isn't correct.", 400)
            );

        await User.updateUserPassword(userId, newPassword);

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
