import { array, string, ZodError } from "zod/v4";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static CATEGORIES_NOT_PROVIDED = new APIError(
        "Please provide the categories you want to add.",
        400,
        "MISSING_CATEGORY"
    );

    static INVALID_DATATYPE = new APIError(
        "The titles should be array of string",
        400,
        "VALIDATION_ERROR"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function adminAddCategoriesValidate(req, res, next) {
    try {
        const { titles = null } = req?.body ?? {};

        if (titles === null) return ErrorsEnum.CATEGORIES_NOT_PROVIDED;

        const Categories = array(string().trim().min(3).max(100));

        req.body.titles = Categories.parse(titles);
        next();
    } catch (err) {
        if (err instanceof ZodError) {
            let code = err.issues[0].code;

            if (code === "invalid_type")
                return next(ErrorsEnum.INVALID_DATATYPE);

            if (code === "too_big" || code === "too_small")
                return next(GlobalErrorsEnum.INVALID_CATEGORY_LENGTH);
        }
        next(err);
    }
}

export default adminAddCategoriesValidate;
