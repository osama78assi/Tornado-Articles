import AuthUserService from "../services/AuthUserService.js";
import { sanitize } from "../util/index.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getUserData(req, res, next) {
    try {
        const { id } = req?.userInfo;

        const user = await AuthUserService.getUserBy(id, false);

        sanitize(user, [["limits", "canGenForgetPassAt"]]);

        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (err) {
        next(err);
    }
}

export default getUserData;
