import { object, string, ZodError } from "zod/v4";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static ONE_FIELD_REQUIRED = new APIError(
        "Provide either the title or the description",
        400,
        "MISSING_DATA"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function updateTopicValidate(req, res, next) {
    try {
        const { title = undefined, description = undefined } = req?.body ?? {};

        if (title === undefined && description === undefined)
            return next(ErrorsEnum.ONE_FIELD_REQUIRED);

        const Query = object({
            title: string().optional(),
            description: string().optional(),
        });

        Object.assign(req.body, Query.parse({ title, description }));

        return next();
    } catch (err) {
        if (err instanceof ZodError) {
            let code = err.issues[0].code;
            let path = err.issues[0].path[0];

            if (code === "invalid_type")
                return next(GlobalErrorsEnum.INVALID_DATATYPE(path, "string"));
        }
        next(err);
    }
}

export default updateTopicValidate;
