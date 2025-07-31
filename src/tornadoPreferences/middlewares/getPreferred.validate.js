import { int, object, string, ZodError } from "zod/v4";
import { MAX_RESULTS, MIN_RESULTS } from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static INVALID_INTERESTED_COUNTS = new APIError(
        "Interested counts (entryInterestedCounts) must be positive integer",
        400,
        "VALIDATION_ERROR"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getPreferredValidate(req, res, next) {
    try {
        const {
            entryInterestedCounts = "9223372036854775807", // As the data sorted by interested counts
            entryItemTitle = "", // When the interested counts is the same then we will sort by (category|topic) title
            limit = MIN_RESULTS,
        } = req?.query ?? {};

        const Query = object({
            entryInterestedCounts: string().regex(/^\d+$/),
            entryItemTitle: string().trim(),
            limit: int(),
        });

        // Attach the validated query (express req.query is immutable in v5+)
        req.validatedQuery = Query.parse({
            entryItemTitle,
            limit: Number(limit),
            entryInterestedCounts: String(entryInterestedCounts),
        });

        // Small validation to reduce handling in catch block
        if (BigInt(entryInterestedCounts) < BigInt(0))
            return next(ErrorsEnum.INVALID_INTERESTED_COUNTS);

        if (limit <= 0 || limit > MAX_RESULTS)
            return next(GlobalErrorsEnum.INVALID_LIMIT("limit", MAX_RESULTS));

        // Pass
        next();
    } catch (err) {
        if (err instanceof ZodError) {
            let code = err.issues[0].code;
            let path = err.issues[0].path[0];
            let expected = err.issues[0].expected;

            if (
                (code === "invalid_type" || code === "invalid_format") &&
                path === "entryInterestedCounts"
            )
                return next(ErrorsEnum.INVALID_INTERESTED_COUNTS);
            if (code === "invalid_type")
                return next(GlobalErrorsEnum.INVALID_DATATYPE(path, expected));
        }
        next(err);
    }
}

export default getPreferredValidate;
