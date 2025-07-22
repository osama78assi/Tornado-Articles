import { object, string, ZodError } from "zod/v4";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static TOO_LONG_REASON = new APIError(
        "The reason's characters length should be 300 maximum",
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
        let { reason = null, userId = null } = req?.body ?? {};

        if (reason === null)
            return next(GlobalErrorsEnum.MISSING_FIELD("reason"));

        if (userId === null)
            return next(GlobalErrorsEnum.MISSING_FIELD("userId"));

        const Data = object({
            reason: string(),
            userId: string().regex(/^\d+$/),
        });

        Object.assign(
            req.body,
            Data.parse({
                reason,
                userId: String(userId),
            })
        );

        // Check reason length
        if (reason.length > 300) return next(ErrorsEnum.TOO_LONG_REASON);

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
