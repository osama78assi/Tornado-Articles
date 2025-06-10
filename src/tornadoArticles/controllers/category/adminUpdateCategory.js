import { Request, Response } from "express";
import CategoryService from "../../services/categoryService";
import OperationError from "../../util/operationError";

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
                    400,
                    "MISSING_TITLE"
                )
            );

        const newDoc = await CategoryService.updateCategoryTitle(
            categoryId,
            categoryTitle
        );

        return res.status(200).json({
            success: true,
            data: newDoc,
        });
    } catch (err) {
        next(err);
    }
}

export default adminUpdateCategory;
