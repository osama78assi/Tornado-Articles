import APIError from "../../../util/APIError.js";
import CategoryService from "../services/categoryService.js";

class ErrorEnum {
    static CATEGORIES_NOT_PROVIDED = new APIError(
        "Please provide the categories you want to add.",
        400,
        "MISSING_CATEGORY"
    );

    static INVALID_DATA_STRUCTURE = new APIError(
        "Please provide the categories titles in an array",
        400,
        "WRONG_CATEGORIES_DATATYPE"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function adminAddCategories(req, res, next) {
    try {
        const { titles = [] } = req?.body ?? {};

        if (titles.length === 0) return next(ErrorEnum.CATEGORIES_NOT_PROVIDED);

        if (!Array.isArray(titles))
            return next(ErrorEnum.INVALID_DATA_STRUCTURE);

        const categories = await CategoryService.addCategories(titles);

        return res.status(200).json({
            success: true,
            data: categories,
        });
    } catch (err) {
        next(err);
    }
}

export default adminAddCategories;
