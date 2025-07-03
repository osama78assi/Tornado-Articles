import { MAX_RESULTS, MIN_RESULTS } from "../../../config/settings.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import TornadoUserService from "../services/tornadoUserService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function adminGetUsers(req, res, next) {
    try {
        const {
            getAfter ,
            limit,
            entryItemName,
        } = req?.query;

        const currentId = req.userInfo.id;

        const users = await TornadoUserService.getUsersData(
            limit,
            entryItemName,
            getAfter,
            currentId
        );

        return res.status(200).json({
            success: true,
            data: users,
        });
    } catch (err) {
        next(err);
    }
}

export default adminGetUsers;
