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
            articlesLimit = MIN_RESULTS, // How many articles you want
            since = new Date(), // default value current time
            categories = [], // The categories he wants
            ignore = [], // To ingore the articles that has been recommended
            lastArticleId = "9223372036854775807", // it will be helpful when there is two article with the same creation date
        } = req?.body ?? {};

        // Define the shema
        const FreshArticleSchema = object({
            articlesLimit: int().min(1).max(MAX_RESULTS),
            since: date(),
            categories: array(string().regex(/^\d+$/)).max(MAX_CATEGORIES_ARTICLE_COUNT),
            ignore: array(string().regex(/^\d+$/)),
            lastArticleId: string().regex(/^\d+$/),
        });

        Object.assign(
            req.body,
            FreshArticleSchema.parse({
                articlesLimit,
                since: new Date(since),
                categories,
                ignore,
                lastArticleId: String(lastArticleId),
            })
        );

        // Pass if okay
        next();
    } catch (err) {
        if (err instanceof ZodError) {
            // Reduce nested 'if' as much as possible
            const errToThrow = {
                too_big: GlobalErrorsEnum.INVALID_LIMIT("articlesLimit", MAX_RESULTS),
                too_small: GlobalErrorsEnum.INVALID_LIMIT("articlesLimit", MAX_RESULTS),

                categories: GlobalErrorsEnum.INVALID_CATEGORIES,
                ignore: GlobalErrorsEnum.INVALID_IGNORE,
                lastArticleId:
                    GlobalErrorsEnum.INVALID_BIGINT_ID("lastArticleId"),
            };

            let code = err?.issues?.[0]?.code;
            let path = err?.issues?.[0]?.path?.[0];
            let expected = err?.issues?.[0]?.expected;

            // For those which intersect by two different errors code
            if (
                ["invalid_type", "invalid_format", "too_big"].includes(code) &&
                ["categories", "ignore", "lastArticleId"].includes(path)
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
