import { array, string, ZodError } from "zod/v4";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function setPreferredDataValidate(req, res, next) {
    // This data maybe topics or categories. SO how to know ? by URL
    let dataName = "data";
    let url = req.url;
    if (url.includes("categories")) dataName = "data (categories)";
    else if (url.includes("topics")) dataName = "data (topics)";

    try {
        let { data = null } = req?.body ?? {};

        if (data === null)
            return next(GlobalErrorsEnum.MISSING_FIELD(dataName));

        const Catgeories = array(string().regex(/^\d+$/));

        req.body.data = Catgeories.parse(data);

        next();
    } catch (err) {
        if (err instanceof ZodError) {
            let code = err.issues[0].code;
            if (code === "invalid_type" || code === "invalid_format") {
                return next(GlobalErrorsEnum.INVALID_BIGINT_IDS(dataName));
            }
        }
        next(err);
    }
}

export default setPreferredDataValidate;
