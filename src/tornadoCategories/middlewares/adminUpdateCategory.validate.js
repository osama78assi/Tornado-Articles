import { object, string, ZodError } from "zod/v4";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static ONE_FIELD_REQUIRED = new APIError(
        "Provide either title or description to edit the category",
        400,
        "VALIDATION_ERROR"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function adminUpdateCategoryValidate(req, res, next) {
    try {
        // undefined used here because when object property isn't found it's undefined
        const { categoryTitle = undefined, categoryDescription = undefined } =
            req?.body ?? {};

        if (categoryTitle === undefined && categoryDescription === undefined)
            return next(ErrorsEnum.ONE_FIELD_REQUIRED);

        const Category = object({
            categoryTitle: string().trim().min(3).max(100).optional(),
            categoryDescription: string().trim().min(10).max(350).optional(),
        });

        req.body = Category.parse({ categoryTitle, categoryDescription });

        next();
    } catch (err) {
        if (err instanceof ZodError) {
            let errToThrow = {
                invalid_type: {
                    categoryTitle: GlobalErrorsEnum.INVALID_TITLE,
                    categoryDescription: GlobalErrorsEnum.INVALID_DESCRIPTION,
                },
                too_big: {
                    categoryTitle: GlobalErrorsEnum.INVALID_TITLE,
                    categoryDescription: GlobalErrorsEnum.INVALID_DESCRIPTION,
                },
                too_small: {
                    categoryTitle: GlobalErrorsEnum.INVALID_TITLE,
                    categoryDescription: GlobalErrorsEnum.INVALID_DESCRIPTION,
                },
            };

            let code = err.issues[0].code;
            let path = err.issues[0].path[0];

            if (errToThrow[code][path]) return next(errToThrow[code][path]);
        }
        next(err);
    }
}

export default adminUpdateCategoryValidate;
