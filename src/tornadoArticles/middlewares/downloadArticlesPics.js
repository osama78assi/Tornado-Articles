import upload from "../../../config/articleImgsMulterConfig.js";
import {
    MAX_ARTICLE_CONTENT_PICS_COUNT,
    MAX_ARTICLE_PICS_SIZE_MB,
} from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import deleteFiles from "../../../util/deleteFiles.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function downloadArticlesPics(req, res, next) {
    try {
        // The fields in upload will make the files attribute an objcet holding arrays of images
        upload.fields([
            { name: "coverPic", maxCount: 1 },
            { name: "contentPics", maxCount: MAX_ARTICLE_CONTENT_PICS_COUNT },
        ])(req, res, async function (err) {
            if (err) {
                await deleteFiles(req?.files);
                if (err instanceof multer.MulterError) {
                    if (err.code === "LIMIT_FILE_SIZE") {
                        return next(
                            new APIError(
                                `One of the photos (content/cover) excced the size limit. the maximum size is ${MAX_ARTICLE_PICS_SIZE_MB}MB.`,
                                413,
                                "SIZE_LIMIT_EXCEEDED"
                            )
                        );
                    }

                    // Custom error
                    if (err.code === "ONLY_IMAGES") {
                        return next(err);
                    }

                    console.log(err);
                    return next(
                        new APIError(
                            "Couldn't upload the photos to the server. Please try again",
                            500,
                            "SERVER_ERROR"
                        )
                    );
                }
            }
            // Continue the chain
            next();
        });
    } catch (err) {
        next(err);
    }
}

export default downloadArticlesPics;
