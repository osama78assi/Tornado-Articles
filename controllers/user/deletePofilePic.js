const { Request, Response } = require("express");
const User = require("../../models/user");
const fs = require("fs/promises");
const path = require("path");
const OperationError = require("../../util/operationError");

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function deletePofilePic(req, res, next) {
    try {
        const userId = req.userInfo.id;

        const profilePic = await User.getProfilePic(userId);

        if (profilePic === null) {
            return next(
                new OperationError("There is no profile photo to delete.", 404)
            );
        }

        const p = path.join(
            __dirname,
            "../../uploads/profilePics",
            profilePic.split("/").at(-1) // extract the path in the server
        );

        await fs.unlink(p);

        await User.setProfilePhoto(userId, null);

        return res.status(200).json({
            status: "success",
            message: "Profile photo deleted successfully",
        });
    } catch (err) {
        next(err);
    }
}

module.exports = deletePofilePic;
