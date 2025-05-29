const { Request, Response } = require("express");
const Category = require("../../models/category");

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function adminDeleteCategory(req, res, next) {
    try {
        const {categoryId} = req?.params;

        await Category.deleteCategory(categoryId);

        return res.status(200).json({
            status: "success",
            message: "Category deleted successfully"
        });
    } catch(err) {
        next(err);
    }
}

module.exports = adminDeleteCategory;