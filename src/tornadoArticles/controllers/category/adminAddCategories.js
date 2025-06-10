import { Request, Response } from "express";
import OperationError from "../../../../util/operationError";
import CategoryService from "../../services/categoryService";

class ErrorEnum {
    static CATEGORIES_NOT_PROVIDED = new OperationError(
        "Please provide the categories you want to add.",
        400,
        "MISSING_CATEGORY"
    );

    static INVALID_DATA_STRUCTURE = new OperationError(
        "Please provide the categories titles in an array",
        400,
        "WRONG_CATEGORIES_DATATYPE"
    );
}

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function adminAddCategories(req, res, next) {
    try {
        const { titles = [] } = req?.body || {};

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
