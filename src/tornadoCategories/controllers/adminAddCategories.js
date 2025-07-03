import CategoryService from "../services/categoryService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function adminAddCategories(req, res, next) {
    try {
        const { titles = [] } = req?.body;

        const categories = await CategoryService.addCategories(titles);

        return res.status(200).json({
            success: true,
            data: categories,
        });
    } catch (err) {
        next(err);
    }
}

export default adminAddCategories;
