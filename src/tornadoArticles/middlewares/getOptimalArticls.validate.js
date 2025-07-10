import { array, int, literal, object, string, union, ZodError } from "zod/v4";
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
async function getOptimalArticlsValidate(req, res, next) {
    try {
        let {
            articlesLimit = MIN_RESULTS, // How many articles you want
            categories = [], // The categories he wants
            lastArticleRank = Number.POSITIVE_INFINITY, // This will be used by optimal articles
            lastArticleId = "9223372036854775807", // When there is the same rank
            ignore = [], // To ignore articles that has been recommended
        } = req?.body ?? {};

        const OptimalArticlesSchema = object({
            articlesLimit: int().min(1).max(MAX_RESULTS),
            categories: array(string().regex(/^\d+$/)).max(
                MAX_CATEGORIES_ARTICLE_COUNT
            ),

            lastArticleRank: union([
                // It maybe positive infinity or number
                string().regex(/^\d+(\.{0,1}\d+)?$/),
                literal(Number.POSITIVE_INFINITY),
                literal("Infinity")
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
            })
        );

        next();
    } catch (err) {
        if (err instanceof ZodError) {
            // Reduce nested 'if' as much as possible
            const errToThrow = {
                too_big: GlobalErrorsEnum.INVALID_LIMIT("articlesLimit", MAX_RESULTS),
                too_small: GlobalErrorsEnum.INVALID_LIMIT("articlesLimit", MAX_RESULTS),
                invalid_union: {
                    lastArticleRank:
                        GlobalErrorsEnum.INVALID_FLOAT_NUMBER(
                            "lastArticleRank"
                        ),
                },

                categories: GlobalErrorsEnum.INVALID_CATEGORIES,
                ignore: GlobalErrorsEnum.INVALID_IGNORE,
                lastArticleId:
                    GlobalErrorsEnum.INVALID_BIGINT_ID("lastArticleId"),
            };

            // Some keywords saved for same reason
            let pathKeywords = ["categories", "ignore", "lastArticleId"];

            let code = err?.issues?.[0]?.code;
            let path = err?.issues?.[0]?.path?.[0];
            let expected = err?.issues?.[0]?.expected;

            // For those fields which intersect by two different errors code
            if (
                (code === "invalid_type" || code === "invalid_format") &&
                pathKeywords.includes(path)
            )
                return next(errToThrow[path]);

            if (code === "invalid_type")
                return next(GlobalErrorsEnum.INVALID_DATATYPE(path, expected));

            if (code === "invalid_union") return next(errToThrow[code][path]);

            if (errToThrow[code]) return next(errToThrow[code]);
        }

        next(err);
    }
}

export default getOptimalArticlsValidate;
