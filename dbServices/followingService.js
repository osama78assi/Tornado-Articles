const FollowedFollower = require("../models/followedFollower");
const OperationError = require("../util/operationError");

class FollowingService {
    static async addFollower(followerId, followedId) {
        try {
            const data = await FollowedFollower.create({
                followerId,
                followedId,
            });

            return data;
        } catch (err) {
            throw err;
        }
    }

    static async removeFollower(followerId, followedId) {
        try {
            const affectedRows = await FollowedFollower.destroy({
                where: {
                    followerId,
                    followedId,
                },
            });

            if (affectedRows === 0)
                throw new OperationError(
                    "You already unfollowed this user.",
                    400
                );

            return affectedRows;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = FollowingService