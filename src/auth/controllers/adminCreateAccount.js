import { unlink } from "fs/promises";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import sanitize from "../../../util/sanitize.js";
import AuthService from "../services/AuthUserService.js";

class ErrorsEnum {
    static INVALID_VALUE = new APIError(
        "Role must be either 'user' or 'admin'",
        400,
        "VALIDATION_ERROR"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function adminCreateAccount(req, res, next) {
    try {
        let {
            fullName,
            email,
            password,
            birthDate,
            gender,
            role = "user",
        } = req?.body;

        // Small validation because the previous has been validated through signup middleware
        if (typeof role !== "string") {
            return next(GlobalErrorsEnum.INVALID_DATATYPE("role", "string"));
        }

        role = role.toLowerCase();

        if (!["user", "admin"].includes(role)) {
            return next(ErrorsEnum.INVALID_VALUE);
        }

        let profilePicName = req?.files?.profilePic?.newName;

        // Build a URL
        if (profilePicName) {
            const protocol = req.protocol;
            const host = req.get("host");
            profilePicName = `${protocol}://${host}/uploads/profilePics/${profilePicName}`;
        }

        const user = await AuthService.createUser(
            fullName,
            email,
            password,
            birthDate,
            gender,
            profilePicName,
            role
        );

        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (err) {
        // When facing the error the photo now in the dist. Delete it
        if (req?.files?.profilePic?.diskPath) {
            await unlink(req?.files?.profilePic?.diskPath);
        }

        next(err);
    }
}

export default adminCreateAccount;
