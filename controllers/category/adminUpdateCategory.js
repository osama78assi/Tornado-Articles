const { Request, Response } = require("express");
const CategoryService = require("../../dbServices/categoryService");
const OperationError = require("../../util/operationError");

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function adminUpdateCategory(req, res, next) {
    try {
        const { categoryId } = req?.params;

        const { categoryTitle = null } = req?.body || {};

        if (categoryTitle === null)
            return next(
                new OperationError(
                    "Please prodive a new title for the category",
                    400
                )
            );

        const newDoc = await CategoryService.updateCategoryTitle(
            categoryId,
            categoryTitle
        );

        return res.status(200).json({
            status: "success",
            data: newDoc,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = adminUpdateCategory;
