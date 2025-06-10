import { Request, Response } from "express";
import { unlink } from "fs/promises";
import { join } from "path";
import isFileExists from "../../../util/isFileExists";
import TornadoUserService from "../services/tornadoUserService";

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
        const oldPhotoUrl = await TornadoUserService.getProfilePic(userId);

        // Set the new photo
        await TornadoUserService.setProfilePhoto(userId, newPic);

        // Remove the old profile pic if exists
        if (oldPhotoUrl !== null) {
            const picPth = join(
                __dirname,
                "../../uploads/profilePics",
                oldPhotoUrl.split("/").at(-1) // extract the path in the server
            );
            await unlink(picPth);
        }

        // For more safety you can read the image and in the catch block check if it's exists if not then create it again
        return res.status(200).json({
            success: true,
            data: {
                profilePic: newPic,
            },
        });
    } catch (err) {
        // If faced some errors therefore delete the uploaded photo
        // Build the URL
        const p = join(
            __dirname,
            "../../uploads/profilePics",
            req?.file?.filename
        );
        if (await isFileExists(p)) await unlink(p);
        next(err);
    }
}

export default changeProfilePic;
