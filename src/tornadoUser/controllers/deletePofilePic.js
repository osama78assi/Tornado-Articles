import { Request, Response } from "express";
import { unlink } from "fs/promises";
import { join } from "path";
import OperationError from "../../../util/operationError";
import TornadoUserService from "../services/tornadoUserService";

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function deletePofilePic(req, res, next) {
    try {
        const userId = req.userInfo.id;

        const profilePic = await TornadoUserService.getProfilePic(userId);

        if (profilePic === null) {
            return next(
                new OperationError(
                    "There is no profile photo to delete.",
                    404,
                    "IMAGE_NOT_FOUND"
                )
            );
        }

        const p = join(
            __dirname,
            "../../uploads/profilePics",
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
