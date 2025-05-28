const { Request, Response } = require("express");
const upload = require("../config/profilePicMulterConfig");

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function downloadProfilePic(req, res, next) {
    try {
        upload.single("profilePic")(req, res, function (err) {
            if (err) return next(err);
            // Continue the chain
            next();
        });
    } catch (err) {
        next(err);
    }
}

module.exports = downloadProfilePic;
