import { Request, Response } from "express";
import OperationError from "../../../util/operationError";
import FolowingService from "../services/followingService";

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function unfollowUser(req, res, next) {
    try {
        const { followedId = null } = req.params;

        const followerId = req.userInfo.id;

        // The user can't follow gim/her self in the first place then how could they unfollow ?
        if (followedId === followerId)
            return next(
                new OperationError(
                    "The account can't unfollow itself.",
                    400,
                    "WRONG_FOLLOWING"
                )
            );

        await FolowingService.removeFollower(followerId, followedId);

        return res.status(200).json({
            success: true,
            message: "Unfollowed successfully",
        });
    } catch (err) {
        next(err);
    }
}

export default unfollowUser;
