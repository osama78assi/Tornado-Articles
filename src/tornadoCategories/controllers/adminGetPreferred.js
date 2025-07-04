import CategoryService from "../services/categoryService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function adminGetPreferred(req, res, next) {
    try {
        const { entryInterestedCounts, entryItemTitle, limit } =
            req?.validatedQuery;

        const categories = await CategoryService.getPreferredCategories(
            entryInterestedCounts,
            entryItemTitle,
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

export default adminGetPreferred;
