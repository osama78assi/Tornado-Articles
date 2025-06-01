const { Request, Response } = require("express");
const UserService = require("../../dbServices/userService");
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

        const followings = await UserService.getFollowings(userId, offset, limit);

        return res.status(200).json({
            status: "success",
            data: followings,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = getFollowings;
