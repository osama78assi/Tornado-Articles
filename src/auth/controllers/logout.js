import redis from "../../../config/redisConfig.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function logout(req, res, next) {
    try {
        const { id } = req.userInfo;
        const { jti } = req.userSession;

        // If we are here then it must be existed. Invalid the session
        await redis.del(`refresh:${jti}`);

        // Now delete the device also
        await redis.lrem(`loggedin:${id}`, 1, jti);

        // To logout we just need to remove the tokens
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: true,
        });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
        });

        return res.status(200).json({
            success: true,
            message: "Logout successfully.",
        });
    } catch (err) {
        next(err);
    }
}

export default logout;
