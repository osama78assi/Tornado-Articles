import { object, string, ZodError } from "zod/v4";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static INVALID_REASON_LENGTH = new APIError(
        "The reason should be at least 20 characters length",
        400,
        "VALIDATION_ERROR"
    );

    static ALL_REASONS_REQUIRED = new APIError(
        "Provide both 'userReason' and 'reason'",
        400,
        "VALIDATION_ERROR"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function adminBanUserValidate(req, res, next) {
    try {
        const {
            banFor = "1 week",
            reason = null,
            userReason = null,
        } = req?.body ?? {};

        if (reason === null || userReason === null)
            return next(ErrorsEnum.ALL_REASONS_REQUIRED);

        const BanSchema = object({
            banFor: string().trim(),
            reason: string(),
            userReason: string(),
        });

        Object.assign(
            req.body,
            BanSchema.parse({
                banFor,
                reason,
                userReason
            })
        );

        // Check user reason length
        if (userReason.length > 300 && userReason.length < 4)
            return next(GlobalErrorsEnum.INVALID_REASON);

        return next();
    } catch (err) {
        if (err instanceof ZodError) {
            let code = err.issues[0].code;
            let path = err.issues[0].path;
            let expected = err.issues[0].expected;

            if (code === "invalid_type")
                return next(GlobalErrorsEnum.INVALID_DATATYPE(path, expected));

            if (code === "too_small")
                return next(ErrorsEnum.INVALID_REASON_LENGTH);
        }
        next(err);
    }
}

export default adminBanUserValidate;
