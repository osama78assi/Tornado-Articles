import UserPreferenceService from "../services/userPreferenceService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getPreferredCategories(req, res, next) {
    try {
        const userId = req.userInfo.id;

        let { limit, entryItemName, getAfter } = req?.query;

        const categories = await UserPreferenceService.getPreferredCategories(
            userId,
            entryItemName,
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

export default getPreferredCategories;
