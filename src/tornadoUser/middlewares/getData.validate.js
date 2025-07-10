import { int, literal, object, string, union, ZodError } from "zod/v4";
import { MAX_RESULTS, MIN_RESULTS } from "../../../config/settings.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getDataValidate(req, res, next) {
    try {
        let {
            getAfter = 1,
            limit = MIN_RESULTS,
            entryItemName = "",
        } = req?.query ?? {};

        const GetUsersSchema = object({
            limit: int().min(1).max(MAX_RESULTS),
            getAfter: union([literal(0), literal(1)]),
            entryItemName: string(),
        });

        req.validatedQuery = GetUsersSchema.parse({
            limit: Number(limit),
            getAfter: Number(getAfter),
            entryItemName,
        });

        next();
    } catch (err) {
        if (err instanceof ZodError) {
            let errToThrow = {
                too_small: GlobalErrorsEnum.INVALID_LIMIT("limit", MAX_RESULTS),
                too_big: GlobalErrorsEnum.INVALID_LIMIT("limit", MAX_RESULTS),
                invalid_union: GlobalErrorsEnum.INVALID_DIRECTION,

                // This will be called only in case of limit has an invalid data type
                invalid_type: GlobalErrorsEnum.INVALID_LIMIT("limit", MAX_RESULTS),
            };

            let code = err.issues[0].code;
            let path = err.issues[0].path[0];
            let expected = err.issues[0].expected;

            if (code === "invalid_type" && path !== "limit")
                return next(GlobalErrorsEnum.INVALID_DATATYPE(path, expected));

            if (errToThrow[code]) return next(errToThrow[code]);
        }
        next(err);
    }
}

export default getDataValidate;
