const { Request, Response } = require("express");
const FolowingService = require("../../dbServices/followingService");
const OperationError = require("../../util/operationError");

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
                new OperationError("The account can't follow itself.", 400)
            );

        await FolowingService.removeFollower(followerId, followedId);

        return res.status(200).json({
            status: "success",
            message: "Unfollowed successfully",
        });
    } catch (err) {
        next(err);
    }
}

module.exports = unfollowUser;
