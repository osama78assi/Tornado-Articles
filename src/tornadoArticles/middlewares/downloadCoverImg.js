import articleImgsStorage from "../../../config/articleImgsStorage.js";
import APIError from "../../../util/APIError.js";
import {
    SingleFileError,
    singleTornadoFile,
} from "../../../util/fileUploaderHandlers.js";
import { deleteFiles } from "../util/index.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function downloadArticleCover(req, res, next) {
    try {
        singleTornadoFile({
            storage: articleImgsStorage,
            fieldName: "coverPic",
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

export default downloadArticleCover;
