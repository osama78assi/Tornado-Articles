import { unlink } from "fs/promises";
import { join } from "path";
import APIError from "../../../util/APIError.js";
import TornadoUserService from "../services/tornadoUserService.js";
import { dirname } from "path";
import { fileURLToPath } from "url";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function deletePofilePic(req, res, next) {
    try {
        const userId = req.userInfo.id;

        const profilePic = await TornadoUserService.getProfilePic(userId);

        if (profilePic === null) {
            return next(
                new APIError(
                    "There is no profile photo to delete.",
                    404,
                    "IMAGE_NOT_FOUND"
                )
            );
        }

        const __dirname = dirname(fileURLToPath(import.meta.url))
        const p = join(
            __dirname,
            "../../../uploads/profilePics",
            profilePic.split("/").at(-1) // extract the path in the server
        );

        await unlink(p);

        await TornadoUserService.setProfilePhoto(userId, null);

        return res.status(200).json({
            success: true,
            message: "Profile photo deleted successfully",
        });
    } catch (err) {
        next(err);
    }
}

export default deletePofilePic;
