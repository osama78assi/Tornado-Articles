import { object, string, ZodError } from "zod/v4";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static ALL_FIELDS_REQUIRED = new APIError(
        "Provide the 'userReason' to send it to the user and the 'reason' to store in the activities",
        400,
        "VALIDATION_ERROR"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function adminDeleteUserValidate(req, res, next) {
    try {
        // Check if the value provided first
        // The reason is by moderator and admins to save in records
        const { userReason = null, reason = null } = req?.body ?? {};

        if (userReason === null || reason === null)
            return next(ErrorsEnum.ALL_FIELDS_REQUIRED);

        // Define the schema
        const Query = object({
            userReason: string().trim().min(4).max(350),
            reason: string(), // don't trim. that will happen in model level
        });

        // If something faild this will throw an error
        req.body.reason = Query.parse({ userReason, reason });

        next();
    } catch (err) {
        if (err instanceof ZodError) {
            let code = err.issues[0].code;
            let path = err.issues[0].path[0]

            if (code === "invalid_type")
                return next(
                    GlobalErrorsEnum.INVALID_DATATYPE(path, "string")
                );

            if (code === "too_big" || code === "too_small")
                return next(GlobalErrorsEnum.INVALID_REASON);
        }

        next(err);
    }
}

export default adminDeleteUserValidate;
