import { string, ZodError } from "zod/v4";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static CODE_REQUIRED = new APIError(
        "Please provide the code to validate the email",
        400,
        "MISSING_FIELD"
    );

    static INVALID_CODE = new APIError(
        "The code must be all numbers",
        400,
        "VALIDATION_ERROR"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function verifyEmailValidate(req, res, next) {
    try {
        const { code = null } = req?.body ?? {};
        const { verifiedEmail } = req?.userInfo;

        if (verifiedEmail) return next(GlobalErrorsEnum.EMAIL_ALREADY_VERIFIED);

        if (code === null) return next(ErrorsEnum.CODE_REQUIRED);

        const Code = string().regex(/^\d+$/);

        req.body.code = Code.parse(code);

        return next();
    } catch (err) {
        if (err instanceof ZodError) {
            next(ErrorsEnum.INVALID_CODE);
        }
        next(err);
    }
}

export default verifyEmailValidate;
