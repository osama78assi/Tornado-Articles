import { array, uuidv4, ZodError } from "zod/v4";
import { MAX_TAGS_ARTICLE_COUNT } from "../../../config/settings.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import APIError from "../../../util/APIError.js";

class ErrorsEnum {
    static INVALID_TAGS_IDS = new APIError("Tags Ids must be UUIDv4", 400, "VALIDATION_ERROR")
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function editArticleTagsValidate(req, res, next) {
    try {
        const {
            tags = undefined, // The tags the user wants to remove
        } = req?.body ?? {};

        if (tags === undefined)
            return next(GlobalErrorsEnum.MISSING_FIELD("tags"));

        const endTags = array(uuidv4()).parse(tags);

        if (endTags.length > MAX_TAGS_ARTICLE_COUNT)
            return GlobalErrorsEnum.INVALID_TAGS;

        req.body.tags = endTags;

        return next();
    } catch (err) {
        if (
            err instanceof ZodError &&
            (err.issues[0].code === "invalid_type" ||
                err.issues[0].code === "invalid_format")
        ) {
            return next(ErrorsEnum.INVALID_TAGS_IDS);
        }
        next(err);
    }
}

export default editArticleTagsValidate;
