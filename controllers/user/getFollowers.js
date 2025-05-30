const { Request, Response } = require("express");
const { MIN_RESULTS } = require("../../config/settings");
const User = require("../../models/user");

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function getFollowers(req, res, next) {
    try {
        const { userId } = req?.params;

        const { offset = 0, limit = MIN_RESULTS } = req?.query || {};

        const followers = await User.getFollowers(userId, offset, limit);

        return res.status(200).json({
            status: "success",
            data: followers,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = getFollowers;
