import { unlink } from "fs/promises";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import sanitize from "../../../util/sanitize.js";
import AuthService from "../services/AuthUserService.js";
import { TORNADO_ROLES } from "../../../config/settings.js";

class ErrorsEnum {
    static INVALID_VALUE = new APIError(
        `Role must be one of these ${TORNADO_ROLES.join(", ")}`,
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

        if (!TORNADO_ROLES.includes(role)) {
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
            message: "Please make the added user verify the email before interact with the website"
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
