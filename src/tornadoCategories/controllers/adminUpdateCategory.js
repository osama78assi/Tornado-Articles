import APIError from "../../../util/APIError.js";
import CategoryService from "../services/categoryService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function adminUpdateCategory(req, res, next) {
    try {
        const { categoryId } = req?.params;

        const { categoryTitle, categoryDescription } = req?.body;

        const newDoc = await CategoryService.updateCategory(
            categoryId,
            categoryTitle,
            categoryDescription
        );

        if (newDoc === undefined)
            return next(
                new APIError(
                    `There is no category with id '${categoryId}'`,
                    404,
                    "CATEGORY_NOT_FOUND"
                )
            );

        return res.status(200).json({
            success: true,
            data: newDoc,
        });
    } catch (err) {
        next(err);
    }
}

export default adminUpdateCategory;
