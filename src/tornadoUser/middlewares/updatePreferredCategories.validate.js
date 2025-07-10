import { array, object, string, uuidv4, ZodError } from "zod/v4";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static INVALID_FORMAT = (field) =>
        new APIError(
            `${field} must be array of categories IDs (string numbers)`,
            400,
            "VALIDATION_ERROR"
        );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function updatePreferredCategoriesValidate(req, res, next) {
    try {
        let { toDelete = [], toAdd = [] } = req?.body ?? {};

        const UpdateCategories = object({
            toDelete: array(string().regex(/^\d+$/)),
            toAdd: array(string().regex(/^\d+$/)),
        });
        
        Object.assign(
            req.body,
            UpdateCategories.parse({
                toAdd,
                toDelete,
            })
        );

        next();
    } catch (err) {
        if (err instanceof ZodError) {
            let errToThrow = {
                invalid_type: (field, type) =>
                    GlobalErrorsEnum.INVALID_DATATYPE(field, type),
                invalid_format: (field) => ErrorsEnum.INVALID_FORMAT(field),
            };

            let code = err.issues[0].code;
            let path = err.issues[0].path[0];
            let type = err.issues[0].expected;

            if (errToThrow[code]) return next(errToThrow[code](path, type));
        }
        next(err);
    }
}

export default updatePreferredCategoriesValidate;
