const { Request, Response } = require("express");
const User = require("../../models/user");
const OperationError = require("../../helper/operationError");

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function searchForUsers(req, res, next) {
    try {
        const { query, offset, limit } = req?.query || {};

        if (query === undefined)
            return next(
                new OperationError("Please provide user name to search.", 400)
            );

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
