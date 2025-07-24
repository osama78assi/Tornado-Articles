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

        const { limit, entryItemName, getAfter } = req?.validatedQuery;

        // This will throw an error if the user doesn't exist
        await TornadoUserService.isUserExists(userId);

        const followers = await FollowingService.getFollowers(
            userId,
            entryItemName,
            getAfter,
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
