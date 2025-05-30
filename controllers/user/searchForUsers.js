const { Request, Response } = require("express");
const User = require("../../models/user");
const OperationError = require("../../helper/operationError");
const { MIN_RESULTS } = require("../../config/settings");

class ErrorEnum {
    static INVALID_QUERY = new OperationError(
        "Please provide user name to search.",
        400
    );

    static INVALID_OFFSET_LIMIT = new OperationError(
        "Offset and limit must be numbers",
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

        if (typeof offset !== "number" || typeof limit !== "number")
            return next(ErrorEnum.INVALID_OFFSET_LIMIT);

        // If the current user is logged in we wanna remove his account from here
        let results = await User.searchByName(
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
