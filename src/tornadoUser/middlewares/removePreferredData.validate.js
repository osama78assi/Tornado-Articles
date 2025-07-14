import { array, string, ZodError } from "zod/v4";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static INVALID_FORMAT = (dataName) =>
        new APIError(
            `${dataName} must be array of IDs (string numbers)`,
            400,
            "VALIDATION_ERROR"
        );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function removePreferredDataValidate(req, res, next) {
    // This data maybe topics or categories. SO how to know ? by URL
    let dataName = "data";
    let url = req.url;
    if (url.includes("categories")) dataName = "data (categories)";
    else if (url.includes("topics")) dataName = "data (topics)";

    try {
        let { data = [] } = req?.body ?? {};

        const Data = array(string().regex(/^\d+$/));

        Object.assign(req.body, { data: Data.parse(data) });

        next();
    } catch (err) {
        if (err instanceof ZodError) {
            let errToThrow = {
                invalid_type: GlobalErrorsEnum.INVALID_DATATYPE(dataName, "array"),
                invalid_format: ErrorsEnum.INVALID_FORMAT(dataName),
            };

            let code = err.issues[0].code;

            if (errToThrow[code]) return next(errToThrow[code]);
        }
        next(err);
    }
}

export default removePreferredDataValidate;
