import { Request, Response } from "express";
import { fields } from "../../../config/articleImgsMulterConfig";
import OperationError from "../../../util/operationError";
import deleteFiles from "../../../util/deleteFiles";
import { MAX_ARTICLE_PICS_SIZE_MB, MAX_ARTICLE_CONTENT_PICS_COUNT } from "../../../config/settings";

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function downloadArticlesPics(req, res, next) {
    try {
        // The fields in upload will make the files attribute an objcet holding arrays of images
        fields([
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
                                413,
                                "SIZE_LIMIT_EXCEEDED"
                            )
                        );
                    }

                    console.log(err);
                    return next(
                        new OperationError(
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
