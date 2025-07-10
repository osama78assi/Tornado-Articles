import sendReasonBanUser from "../../../services/sendReasonBanUser.js";
import APIError from "../../../util/APIError.js";
import generateDateAfter from "../../../util/generateDateAfter.js";
import { WrongPeriod } from "../../../util/parseStrPeriod.js";
import TornadoUserService from "../services/tornadoUserService.js";

class ErrorsEnum {
    static NO_REASON = new APIError(
        "Please provide the reason for the ban",
        400,
        "NO_REASON"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function adminBanUser(req, res, next) {
    try {
        const { userId } = req?.params;
        const { banFor, reason } = req?.body;

        // This will throw an error if the period isn't recognized
        const banTill = generateDateAfter(banFor);

        // Get the user data
        const userData = await TornadoUserService.getUserProps(userId, ["email", "fullName"]);

        // Ban the user
        await TornadoUserService.banUserFor(userId, banTill);

        // Notify the user by email (TODO: do it in the platform)
        sendReasonBanUser(
            {
                userEmail: userData.dataValues.email,
                userName: userData.dataValues.fullName,
            },
            {
                user: process.env.GOOGLE_EMAIL,
                pass: process.env.GOOGLE_APP_PASS,
            },
            reason,
            banFor,
            "1 month"
        );

        return res.status(200).json({
            success: true,
            message: `The user with id '${userId}' has been banned for ${banFor} successfully`,
        });
    } catch (err) {
        if (err instanceof WrongPeriod)
            return next(new APIError(err.message, 400, "WRONG_PERIOD"));

        next(err);
    }
}

export default adminBanUser;
