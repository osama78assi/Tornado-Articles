import CategoryService from "../services/categoryService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function userSearchCategory(req, res, next) {
    try {
        const { query, lastEntryTitle, limit } = req?.validatedQuery;

        const results = await CategoryService.userSearchCategories(
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

export default userSearchCategory;
