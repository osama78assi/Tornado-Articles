import redis from "../../../config/redisConfig.js";
import sendReasonDeleteUser from "../../../services/sendReasonDeleteUser.js";
import APIError from "../../../util/APIError.js";
import AuthUserService from "../services/AuthUserService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function adminDeleteUser(req, res, next) {
    try {
        const { userId } = req?.params;

        const { reason } = req?.body;

        const currentId = req.userInfo.id;

        if (userId === currentId)
            return next(
                new APIError(
                    "Are you serious ? you are the admin how can I delete you ?",
                    400,
                    "ILLEGAL_OPERATION"
                )
            );

        // Get the user name and email
        const user = await AuthUserService.getUserBy(userId, false);

        // This step is dangerous operation you can add extra comfirm like sending the password or user name
        await AuthUserService.deleteUser(userId);

        // If there is a session then invalidate it
        if (await redis.exists(`loggedin:${userId}`)) {
            const JTIs = await redis.lrange(`loggedin:${userId}`, 0, -1);

            JTIs.forEach((jti, i) => {
                JTIs[i] = `refresh:${jti}`;
            });

            await redis.del(...JTIs, `loggedin:${userId}`);
        }

        sendReasonDeleteUser(
            {
                userName: user.dataValues.fullName,
                userEmail: user.dataValues.email,
            },
            {
                user: process.env.GOOGLE_EMAIL,
                pass: process.env.GOOGLE_APP_PASS,
            },
            reason
        );

        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (err) {
        next(err);
    }
}

export default adminDeleteUser;
