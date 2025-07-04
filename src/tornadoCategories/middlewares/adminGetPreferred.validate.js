import { int, literal, object, string, union, ZodError } from "zod/v4";
import { MAX_RESULTS, MIN_RESULTS } from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static INVALID_INTERESTED_COUNTS = new APIError(
        "Interested counts (entryInterestedCounts) must be positive integer",
        400,
        "VALIDATION_ERROR"
    );

    static INVALID_CATEGORY_TITLE_LENGTH = new APIError(
        "Category title's characters length (entryItemTitle) can't be less than 3 or larger than 100",
        400,
        "VALIDATION_ERROR"
    );

    static INVAL;
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function adminGetPreferredValidate(req, res, next) {
    try {
        const {
            entryInterestedCounts = Number.POSITIVE_INFINITY, // As the data sorted by interested counts
            entryItemTitle = "", // When the interested counts is the same then we will sort by category title
            limit = MIN_RESULTS,
        } = req?.query ?? {};

        const Query = object({
            entryInterestedCounts: union([
                literal(Number.POSITIVE_INFINITY),
                string().regex(/^\d+$/),
            ]),
            entryItemTitle: string().trim(),
            limit: int(),
        });

        // Parse the query now
        const q = Query.parse({
            entryItemTitle,
            limit: Number(limit),
            entryInterestedCounts, // Don't parse it becasue this number maybe bigger than safe int in js
        });

        // Attach the validated query (express req.query is immutable in v5+)
        req.validatedQuery = q;

        // Small validation to reduce handling in catch block
        if (entryInterestedCounts < 0)
            return next(ErrorsEnum.INVALID_INTERESTED_COUNTS);

        if (
            entryItemTitle.length > 0 &&
            (entryItemTitle.length < 3 || entryItemTitle.length > 100)
        )
            return next(ErrorsEnum.INVALID_CATEGORY_TITLE_LENGTH);

        if (limit <= 0 || limit > MAX_RESULTS)
            return next(GlobalErrorsEnum.INVALID_LIMIT);

        // Pass
        next();
    } catch (err) {
        if (err instanceof ZodError) {
            let code = err.issues[0].code;
            let path = err.issues[0].path[0];
            let expected = err.issues[0].expected;

            if (code === "invalid_type")
                return next(GlobalErrorsEnum.INVALID_DATATYPE(path, expected));

            if (code === "invalid_union" && path === "entryInterestedCounts")
                return next(ErrorsEnum.INVALID_INTERESTED_COUNTS);
        }
        next(err);
    }
}

export default adminGetPreferredValidate;
