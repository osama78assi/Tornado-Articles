import { Request, Response } from "express";
import upload from "../../../config/profilePicMulterConfig";
import OperationError from "../../../util/operationError";
import { MAX_PROFILE_PIC_SIZE_MB } from "../../../config/settings";

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function downloadProfilePic(req, res, next) {
    try {
        upload.single("profilePic")(req, res, function (err) {
            if (err) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return next(
                        new OperationError(
                            `One of the photos excced the size limit. the maximum size is ${MAX_PROFILE_PIC_SIZE_MB}MB.`,
                            413,
                            "MAX_SIZE_EXCEEDED"
                        )
                    );
                }

                console.log(err);
                return next(
                    new OperationError(
                        "Couldn't upload the photo to the server. Please try again",
                        500,
                        "SERVER_ERROR"
                    )
                );
            }
            // Continue the chain
            next();
        });
    } catch (err) {
        next(err);
    }
}

export default downloadProfilePic;
