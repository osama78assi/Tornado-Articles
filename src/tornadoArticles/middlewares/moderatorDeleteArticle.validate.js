import { object, string, ZodError } from "zod/v4";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static ALL_FIELDS_REQUIRED = new APIError(
        "Provide 'userReason', 'userId' and 'reason' to store it in the activities",
        400,
        "VALIDATION_ERROR"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function moderatorDeleteArticleValidate(req, res, next) {
    try {
        let {
            userReason = null,
            userId = null,
            reason = null,
        } = req?.body ?? {};

        if (userReason === null || userId === null || reason === null)
            return next(ErrorsEnum.ALL_FIELDS_REQUIRED);

        const Data = object({
            userReason: string().trim(),
            userId: string().regex(/^\d+$/),
            reason: string(),
        });

        Object.assign(
            req.body,
            Data.parse({
                userReason,
                reason,
                userId: String(userId),
            })
        );

        // Check user reason length
        if (userReason.length > 300 && userReason.length < 4)
            return next(GlobalErrorsEnum.INVALID_REASON);

        return next();
    } catch (err) {
        if (err instanceof ZodError) {
            let code = err.issues[0].code;
            let path = err.issues[0].path[0];

            if (
                (code === "invalid_type" || code === "invalid_format") &&
                path === "userId"
            )
                return next(GlobalErrorsEnum.INVALID_BIGINT_ID(path));

            if (code === "invalid_type" && path === "reason")
                return next(
                    GlobalErrorsEnum.INVALID_DATATYPE("reason", "string")
                );
        }
        next(err);
    }
}

export default moderatorDeleteArticleValidate;
