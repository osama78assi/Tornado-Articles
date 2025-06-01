const { Request, Response } = require("express");
const { MIN_RESULTS } = require("../../config/settings");
const CategoryService = require("../../dbServices/categoryService");

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function getCategories(req, res, next) {
    try {
        const { offset = 0, limit = MIN_RESULTS } = req?.query;

        const categories = await CategoryService.getCategories(offset, limit);

        return res.status(200).json({
            status: "success",
            data: categories,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = getCategories;
