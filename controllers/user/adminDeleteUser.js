const { Request, Response } = require("express");
const User = require("../../models/user");
const OperationError = require("../../util/operationError");

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function adminDeleteUser(req, res, next) {
    try {
        const { userId } = req?.params;

        const currentId = req.userInfo.id;

        if (userId === currentId)
            return next(
                new OperationError(
                    "Are you serious ? you are the admin how can I delete you ?",
                    400
                )
            );

        // This step is dangerous operation you can add extra comfirm like sending the password or user name
        await User.deleteUser(userId);

        return res.status(200).json({
            status: "success",
            message: "User deleted successfully",
        });
    } catch (err) {
        next(err);
    }
}

module.exports = adminDeleteUser;
