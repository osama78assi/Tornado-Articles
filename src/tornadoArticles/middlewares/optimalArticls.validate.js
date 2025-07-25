import { array, int, literal, object, string, union, ZodError } from "zod/v4";
import {
    MAX_CATEGORIES_ARTICLE_COUNT,
    MAX_RESULTS,
    MAX_TOPICS_ARTICLE_COUNT,
    MIN_RESULTS,
} from "../../../config/settings.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function optimalArticlsValidate(req, res, next) {
    try {
        let {
            articlesLimit = MIN_RESULTS, // How many articles you want
            categories = [], // The categories he wants
            topics = [], // The topics he wants
            lastArticleRank = Number.POSITIVE_INFINITY, // This will be used by optimal articles
            lastArticleId = "9223372036854775807", // When there is the same rank
            ignore = [], // To ignore articles that has been recommended
        } = req?.body ?? {};

        const OptimalArticlesSchema = object({
            articlesLimit: int().min(1).max(MAX_RESULTS),
            categories: array(string().regex(/^\d+$/)).max(
                MAX_CATEGORIES_ARTICLE_COUNT
            ),
            topics: array(string().regex(/^\d+$/)).max(
                MAX_TOPICS_ARTICLE_COUNT
            ),

            lastArticleRank: union([
                // It maybe positive infinity or number
                string().regex(/^\d+(\.{0,1}\d+)?$/),
                literal(Number.POSITIVE_INFINITY),
                literal("Infinity"),
            ]),

            lastArticleId: string().regex(/^\d+$/),
            ignore: array(string().regex(/^\d+$/)),
        });

        Object.assign(
            req.body,
            OptimalArticlesSchema.parse({
                articlesLimit,
                categories,
                lastArticleRank:
                    lastArticleRank === Number.POSITIVE_INFINITY
                        ? Number.POSITIVE_INFINITY
                        : String(lastArticleRank), // To accept both numbers as string or numbers
                lastArticleId: String(lastArticleId),
                ignore,
                topics,
            })
        );

        next();
    } catch (err) {
        if (err instanceof ZodError) {
            let commonErrs = {
                categories: GlobalErrorsEnum.INVALID_CATEGORIES,
                topics: GlobalErrorsEnum.INVALID_TOPICS,
                ignore: GlobalErrorsEnum.INVALID_IGNORE,
                lastArticleId:
                    GlobalErrorsEnum.INVALID_BIGINT_ID("lastArticleId"),
            };

            // Reduce nested 'if' as much as possible
            let errToThrow = {
                articlesLimit: GlobalErrorsEnum.INVALID_LIMIT(
                    "articlesLimit",
                    MAX_RESULTS
                ),
                lastArticleRank:
                    GlobalErrorsEnum.INVALID_FLOAT_NUMBER("lastArticleRank"),

                invalid_type: commonErrs, // No copy here it will take the reference
                invalid_format: commonErrs,
                too_big: commonErrs, // It will use only topics and categories btw
            };

            let code = err?.issues?.[0]?.code;
            let path = err?.issues?.[0]?.path?.[0];
            let expected = err?.issues?.[0]?.expected;

            // Specific path
            if (errToThrow[path]) return next(errToThrow[path]);

            // Path specified by the code
            if (errToThrow[code][path]) return next(errToThrow[code][path]);

            // If not. Take only this case
            if (code === "invalid_type")
                return next(GlobalErrorsEnum.INVALID_DATATYPE(path, expected));
        }

        next(err);
    }
}

export default optimalArticlsValidate;
