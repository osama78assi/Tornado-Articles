const { Request, Response } = require("express");
const OperationError = require("../../util/operationError");
const UserService = require("../../dbServices/userService");

class ErrorEnum {
    static MISSING_NAME = new OperationError(
        "Please provide the new name",
        400
    );
}

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function changeName(req, res, next) {
    try {
        const { newName = null } = req?.body || {};
        // Get the id
        const userId = req?.userInfo.id;

        if (newName === null) return next(ErrorEnum.MISSING_NAME);

        const fullName = await UserService.updateUserName(userId, newName);

        return res.status(200).json({
            status: "success",
            data: {
                fullName,
            },
        });
    } catch (err) {
        next(err);
    }
}

module.exports = changeName;
