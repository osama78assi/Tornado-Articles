import removeDuplicated from "../../../util/removeDuplicated.js";
import UserPreferenceService from "../services/userPreferenceService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function removePreferredCategories(req, res, next) {
    try {
        let { data: categories } = req?.body;

        const userId = req.userInfo.id;

        // Same reason to get meaningful error message
        categories = removeDuplicated(categories);

        await UserPreferenceService.updatePreferredCategories(
            userId,
            categories,
        );

        return res.status(200).json({
            success: true,
            message: "Categoires removed from your preferred categories successfully.",
        });
    } catch (err) {
        next(err);
    }
}

export default removePreferredCategories;
