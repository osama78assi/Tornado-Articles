import { int, object, string, ZodError } from "zod/v4";
import { MAX_RESULTS, MIN_RESULTS } from "../../../config/settings.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getActionsValidate(req, res, next) {
    try {
        const { lastEntryId = "9223372036854775807", limit = MIN_RESULTS } =
            req?.query ?? {};

        const Query = object({
            limit: int(),
            lastEntryId: string().regex(/^\d+$/),
        });

        req.validatedQuery = Query.parse({
            lastEntryId,
            limit: Number(limit),
        });

        if (Number(limit) < 0 || Number(limit) > MAX_RESULTS)
            return next(GlobalErrorsEnum.INVALID_LIMIT("limit", MAX_RESULTS));

        return next();
    } catch (err) {
        if (err instanceof ZodError) {
            let code = err.issues[0].code;
            let path = err.issues[0].path[0];

            if (code === "invalid_type" || code === "invalid_format")
                return next(GlobalErrorsEnum.INVALID_DATATYPE(path, "integer"));
        }

        next(err);
    }
}

export default getActionsValidate;
