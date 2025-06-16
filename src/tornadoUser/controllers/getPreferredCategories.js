import { MIN_RESULTS } from "../../../config/settings.js";
import UserPreferenceService from "../services/userPreferenceService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getPreferredCategories(req, res, next) {
    try {
        const userId = req.userInfo.id;

        const { offset = 0, limit = MIN_RESULTS } = req?.query || {};

        const categories = await UserPreferenceService.getPreferredCategories(
            userId,
            offset,
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
