const { Request, Response } = require("express");
const User = require("../../models/user");
const { MIN_RESULTS } = require("../../config/settings");

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function getFollowings(req, res, next) {
    try {
        const { userId } = req?.params;
        const { offset = 0, limit = MIN_RESULTS } = req?.query || {};

        if (typeof offset !== "number" || typeof limit !== "number")
            return next(
                new OperationError("Offset and limit must be numbers", 400)
            );

        const followings = await User.getFollowings(userId, offset, limit);

        return res.status(200).json({
            status: "success",
            data: followings,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = getFollowings;
