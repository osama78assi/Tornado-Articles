import CategoryService from "../services/categoryService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getCategoryDetails(req, res, next) {
    try {
        const { categoryId } = req?.params;

        const category = await CategoryService.getCategoryDetails(categoryId);

        return res.status(200).json({
            success: true,
            data: category.dataValues,
        });
    } catch (err) {
        next(err);
    }
}

export default getCategoryDetails;
