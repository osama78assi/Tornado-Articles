const { Request, Response } = require("express");
const OperationError = require("../../../util/operationError");
const UserService = require("../../../dbServices/userService");

class ErrorEnum {
    static INVALID_DATA_TYPE = new OperationError(
        "Please provide 'allow' field must be either true or false",
        400
    );
}

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function updateCookiesAccess(req, res, next) {
    try {
        const { allow = null } = req?.body || {};

        if (allow === null || typeof allow !== "boolean")
            return next(ErrorEnum.INVALID_DATA_TYPE);

        const userId = req.userInfo.id;

        await UserService.updateCookieAccess(userId, allow);

        return res.status(200).json({
            status: "success",
            data: {
                allowCookies: allow,
            },
        });
    } catch (err) {
        next(err);
    }
}

module.exports = updateCookiesAccess;
