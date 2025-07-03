import { string, ZodError } from "zod/v4";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function adminUpdateCategoryValidate(req, res, next) {
    try {
        const { categoryTitle = null } = req?.body ?? {};

        if (categoryTitle === null)
            return next(GlobalErrorsEnum.MISSING_FIELD("category title"));

        const Schema = string().trim().min(3).max(100);

        req.body.categoryTitle = Schema.parse(categoryTitle);

        next();
    } catch (err) {
        if (err instanceof ZodError) {
            let code = err.issues[0].code;
            let expected = err.issues[0].expected;

            if (code === "too_small" || code === "too_big")
                return next(GlobalErrorsEnum.INVALID_CATEGORY_LENGTH);

            if (code === "invalid_type")
                return next(GlobalErrorsEnum.INVALID_DATATYPE("categoryTitle", expected));
        }
        next(err);
    }
}

export default adminUpdateCategoryValidate;
