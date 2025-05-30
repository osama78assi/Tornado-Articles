const { Request, Response } = require("express");
const upload = require("../config/profilePicMulterConfig");
const OperationError = require("../helper/operationError");

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function downloadProfilePic(req, res, next) {
    try {
        upload.single("profilePic")(req, res, function (err) {
            if (err) {
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
