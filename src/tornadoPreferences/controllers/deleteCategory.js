import CategoryService from "../services/categoryService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function deleteCategory(req, res, next) {
    try {
        const { categoryId } = req?.params;

        await CategoryService.deleteCategory(categoryId);

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (err) {
        next(err);
    }
}

export default deleteCategory;
