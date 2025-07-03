import { literal, union, ZodError } from "zod/v4";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static INVALID_ALLOW = new APIError(
        "Allow field must be either 1 or 0",
        400,
        "VALIDATION_ERROR"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function updateCookiesAccessValidate(req, res, next) {
    try {
        const { allow = null } = req?.body ?? {};

        if (allow === null)
            return next(GlobalErrorsEnum.MISSING_FIELD("allow"));

        const Allow = union([literal(0), literal(1)]);

        req.body.allow = Allow.parse(Number(allow));

        next();
    } catch (err) {
        if (err instanceof ZodError && err.issues[0].code === "invalid_union")
            return next(ErrorsEnum.INVALID_ALLOW);
        
        next(err);
    }
}

export default updateCookiesAccessValidate;
