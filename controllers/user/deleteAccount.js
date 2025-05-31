const { Request, Response } = require("express");
const User = require("../../models/user");

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function deleteAccount(req, res, next) {
    try {
        const userId = req?.userInfo?.id;

        await User.deleteUser(userId);

        // Delete the token
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
        });

        return res.status(200).json({
            status: "success",
            message: "Account deleted successfully.",
        });
    } catch (err) {
        next(err);
    }
}

module.exports = deleteAccount;
