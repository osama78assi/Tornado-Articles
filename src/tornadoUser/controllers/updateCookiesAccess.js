import APIError from "../../../util/APIError.js";
import TornadoUserService from "../services/tornadoUserService.js";

class ErrorEnum {
    static INVALID_DATA_TYPE = new APIError(
        "Please provide 'allow'. It field must be either true or false",
        400,
        "INVALID_ALLOW_FIELD"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function updateCookiesAccess(req, res, next) {
    try {
        const { allow = null } = req?.body ?? {};

        if (allow === null || typeof allow !== "boolean")
            return next(ErrorEnum.INVALID_DATA_TYPE);

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
