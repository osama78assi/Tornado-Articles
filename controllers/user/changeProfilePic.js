const { Request, Response } = require("express");
const UserService = require("../../dbServices/userService");
const fs = require("fs/promises");
const path = require("path");
const isFileExists = require("../../util/isFileExists");

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function changeProfilePic(req, res, next) {
    try {
        // Get the new photo name
        const profilePicName = req?.file?.filename;

        // Build the URL
        const protocol = req.protocol;
        const host = req.get("host");
        const newPic = `${protocol}://${host}/uploads/profilePics/${profilePicName}`;

        const userId = req.userInfo.id;

        // Get user photo if exists
        const oldPhotoUrl = await UserService.getProfilePic(userId);

        // Set the new photo
        await UserService.setProfilePhoto(userId, newPic);

        // Remove the old profile pic if exists
        if (oldPhotoUrl !== null) {
            const picPth = path.join(
                __dirname,
                "../../uploads/profilePics",
                oldPhotoUrl.split("/").at(-1) // extract the path in the server
            );
            await fs.unlink(picPth);
        }

        // For more safety you can read the image and in the catch block check if it's exists if not then create it again
        return res.status(200).json({
            status: "success",
            data: {
                profilePic: newPic,
            },
        });
    } catch (err) {
        // If faced some errors therefore delete the uploaded photo
        // Build the URL
        const p = path.join(
            __dirname,
            "../../uploads/profilePics",
            req?.file?.filename
        );
        if (await isFileExists(p)) await fs.unlink(p);
        next(err);
    }
}

module.exports = changeProfilePic;
