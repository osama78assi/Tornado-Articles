import { MIN_RESULTS } from "../../../config/settings.js";
import CategoryService from "../services/categoryService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
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
