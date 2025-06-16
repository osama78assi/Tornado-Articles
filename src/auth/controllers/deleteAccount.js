import redis from "../../../config/redisConfig.js";
import AuthUserService from "../services/AuthUserService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function deleteAccount(req, res, next) {
    try {
        const userId = req?.userInfo?.id;

        await AuthUserService.deleteUser(userId);

        // Delete the tokens
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
        });

        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: true,
        });

        // Invalidate the sessions
        if (await redis.exists(`loggedin:${userId}`)) {
            const JTIs = await redis.lrange(`loggedin:${userId}`, 0, -1);

            JTIs.forEach((jti, i) => {
                JTIs[i] = `refresh:${jti}`;
            });

            await redis.del(...JTIs, `loggedin:${userId}`);
        }

        return res.status(200).json({
            success: true,
            message: "Account deleted successfully.",
        });
    } catch (err) {
        next(err);
    }
}

export default deleteAccount;
