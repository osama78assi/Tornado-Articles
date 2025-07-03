import { array, date, int, object, string, uuidv4, ZodError } from "zod/v4";
import {
    MAX_CATEGORIES_ARTICLE_COUNT,
    MAX_RESULTS,
    MIN_RESULTS,
} from "../../../config/settings.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getFreshArticlesValidate(req, res, next) {
    try {
        let {
            limit = MIN_RESULTS, // How many articles you want
            since = new Date(), // default value current time
            categories = [], // The categories he wants
            ignore = [], // To ingore the articles that has been recommended
        } = req?.body ?? {};

        // Define the shema
        const FreshArticleSchema = object({
            limit: int().min(1).max(MAX_RESULTS),
            since: date(),
            categories: array(uuidv4()).max(MAX_CATEGORIES_ARTICLE_COUNT),
            ignore: array(string().regex(/^\d+$/)), // Don't allow really big string numbers
        });

        req.body = FreshArticleSchema.parse({
            limit,
            since: new Date(since),
            categories,
            ignore,
        });

        // Pass if okay
        next();
    } catch (err) {
        if (err instanceof ZodError) {
            // Reduce nested 'if' as much as possible
            const errToThrow = {
                too_big: GlobalErrorsEnum.INVALID_LIMIT,
                too_small: GlobalErrorsEnum.INVALID_LIMIT,

                categories: GlobalErrorsEnum.INVALID_CATEGORIES,
                ignore: GlobalErrorsEnum.INVALID_IGNORE,
            };

            let code = err?.issues?.[0]?.code;
            let path = err?.issues?.[0]?.path?.[0];
            let expected = err?.issues?.[0]?.expected;

            // For those which intersect by two different errors code
            if (
                (code === "invalid_type" || code === "invalid_format") &&
                ["categories", "ignore"].includes(path)
            )
                return next(errToThrow[path]);

            if (code === "invalid_type")
                return next(GlobalErrorsEnum.INVALID_DATATYPE(path, expected));

            if (errToThrow[code]) return next(errToThrow[code]);
        }

        next(err);
    }
}

export default getFreshArticlesValidate;
