import { string, ZodError } from "zod/v4";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static REASON_TOO_LONG = new APIError(
        "The reason string must be less or equal to 300 characters",
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
        const { reason = null } = req?.body ?? {};

        if (reason === null)
            return next(GlobalErrorsEnum.MISSING_FIELD("reason"));

        // Define the schema
        const Reason = string().trim().max(300);

        // If something faild this will throw an error
        req.body.reason = Reason.parse(reason);

        next();
    } catch (err) {
        if (err instanceof ZodError) {
            let code = err.issues[0].code;
            let expected = err.issues[0].expected;

            if (code === "invalid_type")
                return next(GlobalErrorsEnum.INVALID_DATATYPE("reason", expected));

            if (code === "too_big") return next(ErrorsEnum.REASON_TOO_LONG);
        }

        next(err);
    }
}

export default adminDeleteUserValidate;
