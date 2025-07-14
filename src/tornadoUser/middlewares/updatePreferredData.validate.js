import { array, object, string, ZodError } from "zod/v4";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static INVALID_FORMAT = (field, dataName) =>
        new APIError(
            `${field} ${dataName} must be array of IDs (string numbers)`,
            400,
            "VALIDATION_ERROR"
        );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function updatePreferredDataValidate(req, res, next) {
    // This data maybe topics or categories. SO how to know ? by URL
    let dataName = "";
    let url = req.url;
    if (url.includes("categories")) dataName = "(categories)";
    else if (url.includes("topics")) dataName = "(topics)";

    try {
        let { toDelete = [], toAdd = [] } = req?.body ?? {};

        const Data = object({
            toDelete: array(string().regex(/^\d+$/)),
            toAdd: array(string().regex(/^\d+$/)),
        });

        Object.assign(
            req.body,
            Data.parse({
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
                invalid_format: (field) => ErrorsEnum.INVALID_FORMAT(field, dataName),
            };

            let code = err.issues[0].code;
            let path = err.issues[0].path[0];
            let type = err.issues[0].expected;

            if (errToThrow[code]) return next(errToThrow[code](path, type));
        }
        next(err);
    }
}

export default updatePreferredDataValidate;
