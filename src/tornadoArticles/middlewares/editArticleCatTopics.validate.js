import { array, int, object, string, union, ZodError } from "zod/v4";
import {
    MAX_CATEGORIES_ARTICLE_COUNT,
    MAX_TOPICS_ARTICLE_COUNT,
} from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static ONE_FIELD_REQIURED = new APIError(
        "One field is required at least (categories or topics)",
        400,
        "MISSING_DATA"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function editArticleCatTopicsValidate(req, res, next) {
    try {
        const {
            categories = undefined, // Categories array to attach them with the article
            topics = undefined, // Topics array to attach them with the article
        } = req?.body ?? {};

        if (
            categories === undefined &&
            topics === undefined
        )
            return next(ErrorsEnum.ONE_FIELD_REQIURED);

        const Query = object({
            categories: array(union([string().regex(/^\d+$/), int()]))
                .nullable()
                .optional(),

            topics: array(union([string().regex(/^\d+$/), int()]))
                .nullable()
                .optional(),
        });

        const finalObject = Query.parse({
            categories,
            topics,
        });

        // When user tries to add more than 2 categories (in my case) throw error even if he deletes all the existed categories
        if (
            Array.isArray(categories) &&
            categories.length > MAX_CATEGORIES_ARTICLE_COUNT
        )
            return next(GlobalErrorsEnum.INVALID_CATEGORIES);

        // Same for topics
        if (
            Array.isArray(topics) &&
            topics.length > MAX_TOPICS_ARTICLE_COUNT
        )
            return next(GlobalErrorsEnum.INVALID_TOPICS);

        if (req.body) {
            Object.assign(req.body, finalObject);
        } else {
            req.body = finalObject;
        }

        return next();
    } catch (err) {
        if (err instanceof ZodError) {
            let code = err.issues[0].code;
            let path = err.issues[0].path[0];

            let errToThrow = {
                categories:
                    GlobalErrorsEnum.INVALID_CATEGORIES,
                topics: GlobalErrorsEnum.INVALID_TOPICS,
            };

            if (
                ["invalid_union", "invalid_type"].includes(code) &&
                errToThrow[path]
            )
                return next(errToThrow[path]);
        }

        next(err);
    }
}

export default editArticleCatTopicsValidate;
