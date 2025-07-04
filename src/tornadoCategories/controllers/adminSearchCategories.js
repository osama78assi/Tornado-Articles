import CategoryService from "../services/categoryService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function adminSearchCategories(req, res, next) {
    try {
        // The difference here is the admin can see how many interested people in X category
        const { query, lastEntryTitle, limit } = req?.validatedQuery;

        const results = await CategoryService.adminSearchCategories(
            query,
            lastEntryTitle,
            limit
        );

        return res.status(200).json({
            success: true,
            data: results,
        });
    } catch (err) {
        next(err);
    }
}

export default adminSearchCategories;
