const { Request, Response } = require("express");
const { MIN_RESULTS } = require("../../config/settings");
const UserPreference = require("../../models/userPreference");

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function getPreferredCategories(req, res, next) {
    try {
        const userId = req.userInfo.id;

        const { offset = 0, limit = MIN_RESULTS } = req?.query || {};

        const categories = await UserPreference.getPreferredCategories(
            userId,
            offset,
            limit
        );

        return res.status(200).json({
            status: "success",
            data: categories,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = getPreferredCategories;
