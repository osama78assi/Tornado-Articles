import { unlink } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import APIError from "../../../util/APIError.js";
import TornadoUserService from "../services/tornadoUserService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function changeProfilePic(req, res, next) {
    try {
        let newProfilePicName = req?.files?.profilePic?.newName;

        // Build a URL
        if (newProfilePicName) {
            const protocol = req.protocol;
            const host = req.get("host");
            newProfilePicName = `${protocol}://${host}/uploads/profilePics/${newProfilePicName}`;
        } else {
            // If the file not provided then what is the purpos of the request ?
            return next(
                new APIError(
                    "Upload an image to change the old one",
                    400,
                    "MISSING_FIELD"
                )
            );
        }

        const userId = req.userInfo.id;

        // Get user photo if exists
        const oldPhotoUrl = await TornadoUserService.getProfilePic(userId);

        // Set the new photo
        await TornadoUserService.setProfilePhoto(userId, newProfilePicName);

        const __dirname = dirname(fileURLToPath(import.meta.url));
        // Remove the old profile pic if exists
        if (oldPhotoUrl !== null) {
            const picPth = join(
                __dirname,
                "../../../uploads/profilePics",
                oldPhotoUrl.split("/").at(-1) // extract the path in the server
            );
            await unlink(picPth);
        }

        // For more safety you can read the image and in the catch block check if it's exists if not then create it again
        return res.status(200).json({
            success: true,
            data: {
                profilePic: newProfilePicName,
            },
        });
    } catch (err) {
        // If faced some errors therefore delete the uploaded photo
        if (req?.files?.profilePic?.diskPath)
            await unlink(req?.files?.profilePic?.diskPath); // You can run it in background (without await) but I prefer the await (not in production)
        next(err);
    }
}

export default changeProfilePic;
