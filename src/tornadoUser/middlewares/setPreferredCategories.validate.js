import { array, uuidv4, ZodError } from "zod/v4";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static INVALID_CATEGORIES = new APIError(
        "The categories must be array of categories IDs (uuidv4)",
        400,
        "VALIDATION_ERROR"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function setPreferredCategoriesValidate(req, res, next) {
    try {
        let { categories = null } = req?.body ?? {};

        if (categories === null)
            return next(GlobalErrorsEnum.MISSING_FIELD("categories"));

        const Catgeories = array(uuidv4());

        req.body.categories = Catgeories.parse(categories);

        next();
    } catch (err) {
        if (err instanceof ZodError) {
            let code = err.issues[0].code;
            if (code === "invalid_type" || code === "invalid_format") {
                return next(ErrorsEnum.INVALID_CATEGORIES);
            }
        }
        next(err);
    }
}

export default setPreferredCategoriesValidate;
