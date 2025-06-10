import { Request, Response } from "express";
import { MIN_RESULTS } from "../../../../config/settings";
import CategoryService from "../../services/categoryService";

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
            success: true,
            data: categories,
        });
    } catch (err) {
        next(err);
    }
}

export default getCategories;
