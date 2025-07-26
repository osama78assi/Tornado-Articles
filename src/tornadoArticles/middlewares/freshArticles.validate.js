import { array, date, int, object, string, ZodError } from "zod/v4";
import { MAX_RESULTS, MIN_RESULTS } from "../../../config/settings.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function freshArticlesValidate(req, res, next) {
    try {
        let {
            articlesLimit = MIN_RESULTS, // How many articles you want
            since = new Date(), // default value current time
            categories = [], // The categories he wants
            topics = [], // The topics he wants
            ignore = [], // To ingore the articles that has been recommended
            lastArticleId = "9223372036854775807", // it will be helpful when there is two article with the same creation date
        } = req?.body ?? {};

        // Define the shema
        const FreshArticleSchema = object({
            articlesLimit: int(),
            since: date(),
            categories: array(string().regex(/^\d+$/)),
            topics: array(string().regex(/^\d+$/)),
            ignore: array(string().regex(/^\d+$/)),
            lastArticleId: string().regex(/^\d+$/),
        });

        Object.assign(
            req.body,
            FreshArticleSchema.parse({
                articlesLimit,
                since: new Date(since),
                categories,
                topics,
                ignore,
                lastArticleId: String(lastArticleId),
            })
        );

        if (articlesLimit < 0 || articlesLimit > MAX_RESULTS)
            return next(
                GlobalErrorsEnum.INVALID_LIMIT("articlesLimit", MAX_RESULTS)
            );

        // Pass if okay
        next();
    } catch (err) {
        if (err instanceof ZodError) {
            // Reduce nested 'if' as much as possible

            // Common errors between many codes
            let commonErrs = {
                categories: GlobalErrorsEnum.INVALID_BIGINT_IDS("categories"),
                topics: GlobalErrorsEnum.INVALID_BIGINT_IDS("topics"),
                ignore: GlobalErrorsEnum.INVALID_BIGINT_IDS("ingore"),
                lastArticleId:
                    GlobalErrorsEnum.INVALID_BIGINT_ID("lastArticleId"),
            };

            const errToThrow = {
                invalid_type: commonErrs, // Here there is no copy it will take it by reference
                invalid_format: commonErrs,
            };

            let code = err?.issues?.[0]?.code;
            let path = err?.issues?.[0]?.path?.[0];
            let expected = err?.issues?.[0]?.expected;

            if (errToThrow[code][path]) return next(errToThrow[code][path]);

            if (code === "invalid_type")
                return next(GlobalErrorsEnum.INVALID_DATATYPE(path, expected));
        }

        next(err);
    }
}

export default freshArticlesValidate;
