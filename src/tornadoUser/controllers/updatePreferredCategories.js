import removeDuplicated from "../../../util/removeDuplicated.js";
import UserPreferenceService from "../services/userPreferenceService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function updatePreferredCategories(req, res, next) {
    try {
        let { toDelete, toAdd } = req?.body;

        const userId = req.userInfo.id;

        // Same reason to get meaningful error message
        toDelete = removeDuplicated(toDelete);
        toAdd = removeDuplicated(toAdd);

        await UserPreferenceService.updatePreferredCategories(
            userId,
            toAdd,
            toDelete
        );

        return res.status(200).json({
            success: true,
            message: "Preferred categoires edited successfully.",
        });
    } catch (err) {
        next(err);
    }
}

export default updatePreferredCategories;
