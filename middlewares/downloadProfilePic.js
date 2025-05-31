const { Request, Response } = require("express");
const upload = require("../config/profilePicMulterConfig");
const OperationError = require("../helper/operationError");
const { MAX_PROFILE_PIC_SIZE_MB } = require("../config/settings");

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
                            413
                        )
                    );
                }

                console.log(err);
                return next(
                    new OperationError(
                        "Couldn't upload the photo to the server. Please try again",
                        500
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

module.exports = downloadProfilePic;
