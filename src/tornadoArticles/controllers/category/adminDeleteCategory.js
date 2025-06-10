import { Request, Response } from "express";
import CategoryService from "../../services/categoryService";

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function adminDeleteCategory(req, res, next) {
    try {
        const { categoryId } = req?.params;

        await CategoryService.deleteCategory(categoryId);

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (err) {
        next(err);
    }
}

export default adminDeleteCategory;
