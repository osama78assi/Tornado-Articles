import APIError from "../../../util/APIError.js";
import removeDuplicated from "../../../util/removeDuplicated.js";
import UserPreferenceService from "../services/userPreferenceService.js";

class ErrorsEnum {
    static MISSING_CATEGORIES = new APIError(
        "Please provide the categories IDs you want to add as preferred.",
        400,
        "MISSING_CATEGORIES"
    );

    static INVALID_DATATYPE = new APIError(
        "The preferred categories must be an array",
        400,
        "INVALID_CATEGORIES_DATATYPE"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function setPreferredCategories(req, res, next) {
    try {
        let { categories = null } = req?.body ?? {};

        const userId = req.userInfo.id;

        if (categories === null) return next(ErrorsEnum.MISSING_CATEGORIES);

        if (!Array.isArray(categories))
            return next(ErrorsEnum.INVALID_DATATYPE);

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
