const { Request, Response } = require("express");
const FollowingService = require("../../../dbServices/followingService");
const OperationError = require("../../../util/operationError");

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function followUser(req, res, next) {
    try {
        const { followedId } = req.params;

        // Get the follower id which is current user
        const followerId = req.userInfo.id;

        // Self follow isn't allowed (like youtube you can subscribe with yourself)
        if (followerId === followedId)
            return next(
                new OperationError("The account can't follow itself.", 400)
            );

        // Add the follow
        await FollowingService.addFollower(followerId, followedId);

        return res.status(200).json({
            status: "success",
            message: "followed successfully",
        });
    } catch (err) {
        next(err);
    }
}

module.exports = followUser;
