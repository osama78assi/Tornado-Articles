import APIError from "../../../util/APIError.js";
import TornadoUserService from "../services/tornadoUserService.js"

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function updateCookiesAccess(req, res, next) {
    try {
        const { allow } = req?.body;

        const userId = req.userInfo.id;

        await TornadoUserService.updateCookieAccess(userId, allow);

        return res.status(200).json({
            success: true,
            data: {
                allowCookies: allow,
            },
        });
    } catch (err) {
        next(err);
    }
}

export default updateCookiesAccess;
