import { array, object, string, ZodError } from "zod/v4";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static CATEGORIES_NOT_PROVIDED = new APIError(
        "Please provide the categories you want to add.",
        400,
        "MISSING_FIELD"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function addCategoriesValidate(req, res, next) {
    try {
        const { categories = null } = req?.body ?? {};

        if (categories === null) return ErrorsEnum.CATEGORIES_NOT_PROVIDED;

        const Categories = array(
            object({
                title: string(),
                description: string().optional(),
            })
        );

        req.body.categories = Categories.parse(categories);
        next();
    } catch (err) {
        if (err instanceof ZodError) {
            let errToThrow = {
                invalid_type: {
                    title: GlobalErrorsEnum.INVALID_TITLE,
                    description: GlobalErrorsEnum.INVALID_DESCRIPTION,
                },
            };

            let code = err.issues[0].code;
            let path = err.issues[0].path[1]; // Because it's array so it will return any index failed with the property

            if (errToThrow[code][path]) return next(errToThrow[code][path]);
        }
        next(err);
    }
}

export default addCategoriesValidate;
