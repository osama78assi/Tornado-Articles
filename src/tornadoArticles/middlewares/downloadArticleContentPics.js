import articleImgsStorage from "../../../config/articleImgsStorage.js";
import { MAX_ARTICLE_CONTENT_PICS_COUNT } from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import deleteFiles from "../../../util/deleteFiles.js";
import {
    fieldsTornadoFiles,
    FileLimitExceeded,
    SingleFileError,
} from "../../../util/fileUploaderHandlers.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function downloadArticleContentPics(req, res, next) {
    try {
        fieldsTornadoFiles({
            storage: articleImgsStorage,
            fields: [{ name: "contentPics", maxCount: 5 }],
        })(req, res, async function (err) {
            try {
                if (err) {
                    // Delete the uploaded photos
                    await deleteFiles(req.files);

                    if (err instanceof SingleFileError) {
                        return next(
                            new APIError(
                                "Only one cover picture allowed. But uploaded many",
                                400,
                                "VALIDATION_ERROR"
                            )
                        );
                    }

                    if (err instanceof FileLimitExceeded) {
                        return next(
                            GlobalErrorsEnum.ARTICLE_IMAGES_LIMIT_EXCCEDED(
                                MAX_ARTICLE_CONTENT_PICS_COUNT
                            )
                        );
                    }

                    // If the error is known
                    if (err instanceof APIError) return next(err);

                    // Log the error if you want
                    return next(err);
                }

                // No error here
                return next();
            } catch (err) {
                next(err);
            }
        });
    } catch (err) {
        next(err);
    }
}

export default downloadArticleContentPics;
