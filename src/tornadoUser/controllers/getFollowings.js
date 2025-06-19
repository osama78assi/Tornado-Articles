import { MAX_RESULTS, MIN_RESULTS } from "../../../config/settings.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import FollowingService from "../services/followingService.js";
import TornadoUserService from "../services/tornadoUserService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getFollowings(req, res, next) {
    try {
        const { userId } = req?.params;
        const {
            limit = MIN_RESULTS,
            entryItemName = "",
            getAfter = 1,
        } = req?.query || {};

        getAfter = Number(getAfter);

        if (![0, 1].includes(getAfter))
            return next(GlobalErrorsEnum.INVALID_DIRECTION);

        limit = Number(limit);

        if (limit <= 0 || limit > MAX_RESULTS)
            return next(GlobalErrorsEnum.INVALID_LIMIT);

        // This will throw an error if the user doesn't exists
        await TornadoUserService.getUserById(userId);

        const followings = await FollowingService.getFollowings(
            userId,
            entryItemName,
            getAfter,
            limit
        );

        return res.status(200).json({
            success: true,
            data: followings,
        });
    } catch (err) {
        next(err);
    }
}

export default getFollowings;
