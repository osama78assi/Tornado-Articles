const { Request, Response } = require("express");
const upload = require("../config/articleImgsMulterConfig");
const OperationError = require("../helper/operationError");
const deleteFiles = require("../helper/deleteFiles");
const { MAX_ARTICLE_PICS_SIZE_MB, MAX_ARTICLE_CONTENT_PICS_COUNT } = require("../config/settings");

/**
 *{2}
 * @param {Request} req
 * @param {Response} res
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
                            new OperationError(
                                `One of the photos (content/cover) excced the size limit. the maximum size is ${MAX_ARTICLE_PICS_SIZE_MB}MB.`,
                                413
                            )
                        );
                    }

                    console.log(err);
                    return next(
                        new OperationError(
                            "Couldn't upload the photos to the server. Please try again",
                            500
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

module.exports = downloadArticlesPics;
