import { date, int, object, string, ZodError } from "zod/v4";
import { MIN_RESULTS } from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static INVALID_DATE = () => {
        const cachedErr = GlobalErrorsEnum.INVALID_DATATYPE("since", "Date");

        // Use the same error but add hint
        cachedErr.additionalData.hint =
            "Check if you are using correct format for ISO date string. and check if it's URL encoded. in JavaScript something like URLSearchParams may help";
        return cachedErr;
    };

    static AUTHOR_ID_REQUIRED = new APIError(
        "The authorId is requried parameter",
        400,
        "VALIDATION_FIELD"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getArticlesForValidate(req, res, next) {
    try {
        const {
            limit = MIN_RESULTS, // Article limit the user want
            since = new Date(), // Last article createdAt
            lastEntryId = "9223372036854775807", // Last article ID when there is two articles at same time (nearly impossible to happen b )
            authorId = null, // This is required
        } = req?.query ?? {};

        if (authorId === null) return next(ErrorsEnum.AUTHOR_ID_REQUIRED);

        const Query = object({
            limit: int(),
            since: date(),
            lastEntryId: string().regex(/^\d+$/),
            authorId: string().regex(/^\d+$/),
        });

        req.validatedQuery = Query.parse({
            limit: Number(limit),
            since: new Date(since),
            lastEntryId, // Leave it string
            authorId, // Leave it null or string
        });

        return next();
    } catch (err) {
        if (err instanceof ZodError) {
            let code = err.issues[0].code;
            let path = err.issues[0].path[0];
            let expected = err.issues[0].expected;

            if (
                code === "invalid_type" &&
                (path === "lastEntryId" || path === "authorId")
            )
                return next(GlobalErrorsEnum.INVALID_BIGINT_ID("lastEntryId"));

            if (code === "invalid_type" && path === "since")
                return next(ErrorsEnum.INVALID_DATE());

            if (code === "invalid_type")
                return GlobalErrorsEnum.INVALID_DATATYPE(path, expected);
        }
        next(err);
    }
}

export default getArticlesForValidate;
