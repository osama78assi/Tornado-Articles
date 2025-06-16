import redis from "../../../config/redisConfig.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getLoggedInDevices(req, res, next) {
    try {
        const { id } = req.userInfo;

        const JTIs = await redis.lrange(`loggedin:${id}`, 0, -1);

        JTIs.forEach((jti, i) => {
            JTIs[i] = `refresh:${jti}`;
        });

        // Get all sessions for current user
        const sessions = await redis.mget(JTIs);

        sessions.forEach((session, i) => {
            // Get only the device type
            sessions[i] = session.split("=")[1];
        });

        return res.status(200).json({
            success: true,
            data: sessions,
        });
    } catch (err) {
        next(err);
    }
}

export default getLoggedInDevices;
