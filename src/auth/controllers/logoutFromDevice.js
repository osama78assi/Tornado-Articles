import redis from "../../../config/redisConfig.js";
import APIError from "../../../util/APIError.js";

class ErrorsEnum {
    static DEVICE_NOT_EXISTS = new APIError(
        "The device either logged out or it doesn't even exists",
        404,
        "DEVICE_NOT_EXISTS"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function logoutFromDevice(req, res, next) {
    try {
        // Get current session to remove the cookies if it's the device
        const { jti: currentJti } = req.userSession;

        const { id } = req.userInfo;

        const { deviceName } = req?.query;

        // Get the authenticated sesssions
        const sessions = await redis.lrange(`loggedin:${id}`, 0, -1);

        // Get all devices details for the sessions
        sessions.forEach((session, i) => {
            sessions[i] = `refresh:${session}`;
        });
        const devices = await redis.mget(sessions);

        // Get the wanted device
        let keyToDelete = null;
        devices.map((deviceNme, i) => {
            if (deviceNme.endsWith(deviceName)) {
                keyToDelete = sessions[i]; // Extract key
            }
        });

        if (keyToDelete === null) return next(ErrorsEnum.DEVICE_NOT_EXISTS);

        await redis.del(keyToDelete);
        keyToDelete = keyToDelete.substring(8); // Remove 'refersh:' from the key
        await redis.lrem(`loggedin:${id}`, 1, keyToDelete);

        // If the same session then remove cookies
        if (keyToDelete === currentJti) {
            res.clearCookie("accessToken", {
                httpOnly: true,
                secure: true,
            });

            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: true,
            });
        }

        return res.status(200).json({
            success: true,
            message: `Device ${deviceName} has been logout successfully.`,
        });
    } catch (err) {
        next(err);
    }
}

export default logoutFromDevice;
