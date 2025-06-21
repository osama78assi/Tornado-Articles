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
        let {
            getAfter = 1,
            limit = MIN_RESULTS,
            entryItemName = "",
        } = req?.query ?? {};

        getAfter = Number(getAfter);

        if (![0, 1].includes(getAfter))
            return next(GlobalErrorsEnum.INVALID_DIRECTION);

        limit = Number(limit);

        if (limit <= 0 || limit > MAX_RESULTS)
            return next(GlobalErrorsEnum.INVALID_LIMIT);

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
