import { MIN_RESULTS } from "../../../config/settings.js";
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
        const { offset = 0, limit = MIN_RESULTS } = req?.query || {};

        // This will throw an error if the user doesn't exists
        await TornadoUserService.getUserById(userId);

        const followings = await FollowingService.getFollowings(
            userId,
            offset,
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
