import articleImgsStorage from "../../../config/articleImgsStorage.js";
import { MAX_ARTICLE_CONTENT_PICS_COUNT } from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import deleteFiles from "../../../util/deleteFiles.js";
import {
    fieldsTornadoFiles,
    FileLimitExceeded,
    SingleFileError,
} from "../../../util/fileUploaderHandlers.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function downloadArtilcesPics(req, res, next) {
    try {
        fieldsTornadoFiles({
            storage: articleImgsStorage,
            fields: [
                { name: "coverPic", maxCount: 1 },
                { name: "contentPics", maxCount: 5 },
            ],
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
                            new APIError(
                                `Content pictures limit exceeded. Allowed only ${MAX_ARTICLE_CONTENT_PICS_COUNT} pictures.`,
                                400,
                                "VALIDATION_ERROR"
                            )
                        );
                    }

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

export default downloadArtilcesPics;
