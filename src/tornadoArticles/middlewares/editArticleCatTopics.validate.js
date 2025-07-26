import { array, int, object, string, union, ZodError } from "zod/v4";
import { MAX_TOPICS_ARTICLE_COUNT } from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static ONE_FIELD_REQIURED = new APIError(
        "One field is required at least (category or topics)",
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
            categoryId = undefined,
            topics = undefined, // Topics array to attach them with the article
        } = req?.body ?? {};

        if (categoryId === undefined && topics === undefined)
            return next(ErrorsEnum.ONE_FIELD_REQIURED);

        const Query = object({
            categoryId: string().regex(/^\d+$/).nullable().optional(),

            topics: array(union([string().regex(/^\d+$/), int()]))
                .nullable()
                .optional(),
        });

        const finalObject = Query.parse({
            categoryId: String(categoryId),
            topics,
        });

        // Check if topics is less than max
        if (Array.isArray(topics) && topics.length > MAX_TOPICS_ARTICLE_COUNT)
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
                categoryId: GlobalErrorsEnum.INVALID_BIGINT_ID("categoryId"),
                topics: GlobalErrorsEnum.INVALID_TOPICS,
            };

            if (
                ["invalid_union", "invalid_type", "invalid_format"].includes(
                    code
                ) &&
                errToThrow[path]
            )
                return next(errToThrow[path]);
        }

        next(err);
    }
}

export default editArticleCatTopicsValidate;
