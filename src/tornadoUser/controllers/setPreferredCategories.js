import APIError from "../../../util/APIError.js";
import removeDuplicated from "../../../util/removeDuplicated.js";
import UserPreferenceService from "../services/userPreferenceService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function setPreferredCategories(req, res, next) {
    try {
        let { categories } = req?.body;

        const userId = req.userInfo.id;

        // When user try to add many categories if he repeated the same category.
        // A unique constraint error will be thrown not foriegn key violate
        categories = removeDuplicated(categories);

        const categoriesData =
            await UserPreferenceService.addPreferredCategories(
                userId,
                categories
            );

        return res.status(200).json({
            success: true,
            data: categoriesData,
        });
    } catch (err) {
        next(err);
    }
}

export default setPreferredCategories;
