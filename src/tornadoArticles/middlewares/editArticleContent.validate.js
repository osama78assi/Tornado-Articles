import { string, ZodError } from "zod/v4";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import deleteFiles from "../../../util/deleteFiles.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function editArticleContentValidate(req, res, next) {
    try {
        let {
            content = null, // New content to update
        } = req?.body ?? {};

        if (content === null)
            return next(GlobalErrorsEnum.MISSING_FIELD("content"));

        content = string().parse(content);

        if (req.body) req.body.content = content;
        else {
            req.body = {};
            req.body.content = content;
        }

        return next();
    } catch (err) {
        // NOTE: there may will be images
        await deleteFiles(req?.files);

        if (err instanceof ZodError && err.issues[0].code === "invalid_type")
            return next(GlobalErrorsEnum.INVALID_DATATYPE("content", "string"));
        next(err);
    }
}

export default editArticleContentValidate;
