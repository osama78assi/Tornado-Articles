import { MIN_RESULTS } from "../../../config/settings.js";
import FollowingService from "../services/followingService.js";
import TornadoUserService from "../services/tornadoUserService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getFollowers(req, res, next) {
    try {
        const { userId } = req?.params;

        const { offset = 0, limit = MIN_RESULTS } = req?.query || {};

        // This will throw an error if the user doesn't exists
        await TornadoUserService.getUserById(userId);

        const followers = await FollowingService.getFollowers(
            userId,
            offset,
            limit
        );

        return res.status(200).json({
            success: true,
            data: followers,
        });
    } catch (err) {
        next(err);
    }
}

export default getFollowers;
