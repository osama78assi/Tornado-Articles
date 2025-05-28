const { Request, Response } = require("express");
const OperationError = require("../../helper/operationError");
const Category = require("../../models/category");

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function adminAddCategories(req, res, next) {
    try {
        const { titles = null } = req?.body || {};

        if (titles === null)
            return next(
                new OperationError(
                    "Please provide the categories you want to add.",
                    400
                )
            );

        const categories = await Category.addCategories(titles);

        return res.status(200).json({
            status: "success",
            data: categories,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = adminAddCategories;
