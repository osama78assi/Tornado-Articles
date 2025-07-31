import CategoryService from "../services/categoryService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function addCategories(req, res, next) {
    try {
        const { categories: categoriesData } = req?.body;

        const categories = await CategoryService.addCategories(categoriesData);

        return res.status(200).json({
            success: true,
            data: categories,
        });
    } catch (err) {
        next(err);
    }
}

export default addCategories;
