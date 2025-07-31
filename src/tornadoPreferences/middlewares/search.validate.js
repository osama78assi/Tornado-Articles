import { int, object, string, ZodError } from "zod/v4";
import { MAX_RESULTS, MIN_RESULTS } from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static INVALID_CATEGORY_TITLE = new APIError(
        "There is no category title where it's character's length is larger than 100",
        400,
        "VALIDATION_ERROR"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function searchValidate(req, res, next) {
    try {
        const {
            query = null,
            lastEntryTitle = "",
            limit = MIN_RESULTS,
        } = req?.query;

        if (query === null)
            return next(GlobalErrorsEnum.MISSING_FIELD("query"));

        const Query = object({
            query: string(),
            lastEntryTitle: string(),
            limit: int(),
        });

        req.validatedQuery = Query.parse({
            query,
            lastEntryTitle,
            limit: Number(limit),
        });

        if (req.validatedQuery.lastEntryTitle.length > 100)
            return next(ErrorsEnum.INVALID_CATEGORY_TITLE);

        if (
            req.validatedQuery.limit < 0 ||
            req.validatedQuery.limit > MAX_RESULTS
        )
            return next(GlobalErrorsEnum.INVALID_LIMIT("limit", MAX_RESULTS));

        return next();
    } catch (err) {
        if (err instanceof ZodError && err.issues[0].code === "invalid_type") {
            return next(
                GlobalErrorsEnum.INVALID_DATATYPE(
                    err?.issues[0]?.path[0],
                    err?.issues[0]?.expected
                )
            );
        }

        next(err);
    }
}

export default searchValidate;
