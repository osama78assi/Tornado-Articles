import CategoryService from "../services/categoryService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getCategories(req, res, next) {
    try {
        let { limit, entryItemTitle, getAfter } = req?.query;

        const categories = await CategoryService.getCategories(
            entryItemTitle,
            getAfter,
            limit
        );

        return res.status(200).json({
            success: true,
            data: categories,
        });
    } catch (err) {
        next(err);
    }
}

export default getCategories;
