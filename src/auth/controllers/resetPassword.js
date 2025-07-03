import { compare } from "bcryptjs";
import redis from "../../../config/redisConfig.js";
import { UPDATE_PASSWORD_LIMIT } from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import isPassedTimeBy from "../../../util/isPassedTimeBy.js";
import AuthUserService from "../services/AuthUserService.js";

class ErrorsEnum {
    static INCORRECT_PASSWORD = new APIError(
        "The password isn't correct.",
        400,
        "INVALID_PASSWORD"
    );

    static SAME_PASSWORD = new APIError(
        "The new password is the same as old. Please choose another one",
        400,
        "SAME_PASSWORD"
    );
    
    static TOO_EARLY_CHANGE = new APIError(
        `You can change your password one every ${UPDATE_PASSWORD_LIMIT}`,
        429, // It considerd too many requests
        "TOO_AERLY_CHANGE"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function resetPassword(req, res, next) {
    try {
        const { oldPassword, newPassword } = req?.body;

        // The user should be logged in
        const userId = req.userInfo.id;

        const user = await AuthUserService.getUserBy(userId, false);

        // The user can change password once in 15 days (according to my settings)
        // This logic must be at databse table service but due to the expensive operation it's made here
        if (
            user.dataValues.passwordChangeAt !== null &&
            !isPassedTimeBy(
                new Date(),
                user.dataValues.passwordChangeAt,
                UPDATE_PASSWORD_LIMIT
            )
        ) {
            return next(ErrorsEnum.TOO_EARLY_CHANGE);
        }

        // This must be tested with server hosting to give better insights
        const [isCorrectPassword, isSamePassword] = await Promise.all([
            compare(oldPassword, user.dataValues.password),
            compare(newPassword, user.dataValues.password),
        ]);

        // const isCorrectPassword = await compare(oldPassword, user.dataValues.password);

        if (!isCorrectPassword) return next(ErrorsEnum.INCORRECT_PASSWORD);

        // Check if the password is the same
        // if (await compare(newPassword, user.dataValues.password))
        if (isSamePassword) return next(ErrorsEnum.SAME_PASSWORD);

        await AuthUserService.updateUserPassword(userId, newPassword);

        // Logout the user
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
        });

        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: true,
        });

        // Invalidate all the sessions (of all devices) for current user
        const JTIs = await redis.lrange(`loggedin:${userId}`, 0, -1);

        JTIs.forEach((jti, i) => {
            JTIs[i] = `refresh:${jti}`;
        });

        // Delete all of them with the list of all devices
        await redis.del(...JTIs, `loggedin:${userId}`);

        return res.status(200).json({
            success: true,
            message:
                "Password changed successfully. Please login in your new password",
        });
    } catch (err) {
        next(err);
    }
}

export default resetPassword;
