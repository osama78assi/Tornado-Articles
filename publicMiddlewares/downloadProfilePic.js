import upload from "../config/profilePicMulterConfig.js";
import { MAX_PROFILE_PIC_SIZE_MB } from "../config/settings.js";
import APIError from "../util/APIError.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function downloadProfilePic(req, res, next) {
    try {
        upload.single("profilePic")(req, res, function (err) {
            if (err) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return next(
                        new APIError(
                            `One of the photos excced the size limit. the maximum size is ${MAX_PROFILE_PIC_SIZE_MB}MB.`,
                            413,
                            "MAX_SIZE_EXCEEDED"
                        )
                    );
                }

                // This is custom error
                if (err.code === "ONLY_IMAGES") {
                    return next(err);
                }

                console.log(err);
                return next(
                    new APIError(
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
