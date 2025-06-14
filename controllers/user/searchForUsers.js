const { Request, Response } = require("express");
const UserService = require("../../dbServices/userService");
const OperationError = require("../../util/operationError");
const { MIN_RESULTS } = require("../../config/settings");

class ErrorEnum {
    static INVALID_QUERY = new OperationError(
        "Please provide user name to search.",
        400
    );
}

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function searchForUsers(req, res, next) {
    try {
        const {
            query = null,
            offset = 0,
            limit = MIN_RESULTS,
        } = req?.query || {};

        if (query === null) return next(ErrorEnum.INVALID_QUERY);

        // If the current user is logged in we wanna remove his account from here
        let results = await UserService.searchByName(
            query,
            limit,
            offset,
            req?.userInfo?.id || null
        );

        return res.status(200).json({
            status: "success",
            data: results,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = searchForUsers;
