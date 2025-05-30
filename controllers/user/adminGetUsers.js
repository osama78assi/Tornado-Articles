const { Request, Response } = require("express");
const User = require("../../models/user");
const OperationError = require("../../helper/operationError");
const { MIN_RESULTS } = require("../../config/settings");

class ErrorEnum {
    static FIELD_NOT_EXISTS = new OperationError(
        "The field must be either fullName or createAt.",
        400
    );
    static WRONG_DIRECTION = new OperationError(
        "The sort direction must be either ASC or DESC"
    );
}

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function adminGetUsers(req, res, next) {
    try {
        const {
            offset = 0,
            limit = MIN_RESULTS,
            sortBy = "fullName",
            sortDir = "ASC",
        } = req?.query;

        if (!["ASC", "DESC"].includes(sortDir.toLocaleUpperCase()))
            return next(ErrorEnum.WRONG_DIRECTION);

        if (!["fullname", "createdat"].includes(sortBy.toLocaleLowerCase()))
            return next(ErrorEnum.FIELD_NOT_EXISTS);

        const currentId = req.userInfo.id;

        const users = await User.getUsersData(
            offset,
            limit,
            sortBy,
            sortDir,
            currentId
        );

        return res.status(200).json({
            status: "success",
            data: users,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = adminGetUsers;
