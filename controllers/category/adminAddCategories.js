const { Request, Response } = require("express");
const OperationError = require("../../util/operationError");
const CategoryService = require("../../dbServices/categoryService");

class ErrorEnum {
    static CATEGORIES_NOF_PROVIDED = new OperationError(
        "Please provide the categories you want to add.",
        400
    );

    static INVALID_DATA_STRUCTURE = new OperationError(
        "Please provide the categories titles in an array",
        400
    );
}

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function adminAddCategories(req, res, next) {
    try {
        const { titles = [] } = req?.body || {};

        if (titles.length === 0) return next(ErrorEnum.CATEGORIES_NOF_PROVIDED);

        if (!Array.isArray(titles))
            return next(ErrorEnum.INVALID_DATA_STRUCTURE);

        const categories = await CategoryService.addCategories(titles);

        return res.status(200).json({
            status: "success",
            data: categories,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = adminAddCategories;
