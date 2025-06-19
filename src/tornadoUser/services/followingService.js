import { Op } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";
import APIError from "../../../util/APIError.js";
import User from "../../auth/models/user.js";
import FollowedFollower from "../models/followedFollower.js";

class FollowingService {
    static async addFollower(followerId, followedId) {
        // Start unmanaged transaction
        const t = await sequelize.transaction();
        try {
            // First, lock the rows to be updated
            await User.findByPk(followedId, {
                transaction: t,
                lock: t.LOCK.UPDATE,
            });

            await User.findByPk(followerId, {
                transaction: t,
                lock: t.LOCK.UPDATE,
            });

            const data = await FollowedFollower.create(
                {
                    followerId,
                    followedId,
                },
                { transaction: t }
            );

            // Increase the followers for followed and the opposite
            await User.increment("followerCounts", {
                where: {
                    id: followedId,
                },
                transaction: t,
            });

            await User.increment("followingCounts", {
                where: {
                    id: followerId,
                },
                transaction: t,
            });

            await t.commit();
            return data;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    static async removeFollower(followerId, followedId) {
        const t = await sequelize.transaction();
        try {
            // Lock the rows
            await User.findByPk(followerId, {
                transaction: t,
                lock: t.LOCK.UPDATE,
            });

            await User.findByPk(followedId, {
                transaction: t,
                lock: t.LOCK.UPDATE,
            });

            const affectedRows = await FollowedFollower.destroy({
                where: {
                    followerId,
                    followedId,
                },
                transaction: t,
            });

            await User.decrement("followerCounts", {
                where: {
                    id: followedId,
                },
                transaction: t,
            });

            await User.decrement("followingCounts", {
                where: {
                    id: followerId,
                },
                transaction: t,
            });

            if (affectedRows === 0) {
                throw new APIError(
                    "You already unfollowed this user.",
                    400,
                    "NO_DATA"
                );
            }

            await t.commit();
            return affectedRows;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    // Get who is follower of user X
    static async getFollowers(
        userId,
        entryItemName,
        getAfter,
        limit = MIN_RESULTS
    ) {
        try {
            const dir = getAfter
                ? { [Op.gt]: entryItemName }
                : { [Op.lt]: entryItemName };

            const followers = await FollowedFollower.findAll({
                attributes: [],
                where: {
                    followedId: userId,
                    "$follower.fullName$": dir,
                },
                include: {
                    model: User,
                    as: "follower",
                    attributes: ["id", "fullName", "profilePic", "gender"],
                },
                limit,
                order: [[{ model: User, as: "follower" }, "fullName", "ASC"]],
                // benchmark: true,
                // logging: function (sql, timeMs) {
                //     loggingService.emit("query-time-usage", { sql, timeMs });
                // },
            });

            // Update the array. Send only the data for followers
            return followers.map((follower) => {
                return follower.dataValues.follower;
            });
        } catch (err) {
            throw err;
        }
    }

    // Get who is followed by user X
    static async getFollowings(
        userId,
        entryItemName,
        getAfter,
        limit = MIN_RESULTS
    ) {
        try {
            // Same as above
            const dir = getAfter
                ? { [Op.gt]: entryItemName }
                : { [Op.lt]: entryItemName };

            // Here join depend on followedId
            const followings = await FollowedFollower.findAll({
                attributes: [],
                where: {
                    followerId: userId,
                    "$following.fullName$": dir,
                },
                include: {
                    model: User,
                    as: "following",
                    attributes: ["id", "fullName", "profilePic", "gender"],
                },
                order: [[{ model: User, as: "following" }, "fullName", "ASC"]],
                limit,
                // benchmark: true,
                // logging: function (sql, timeMs) {
                //     loggingService.emit("query-time-usage", { sql, timeMs });
                // },
            });

            // Update the array. Send only the data for followings
            return followings.map((following) => {
                return following.dataValues.following;
            });
        } catch (err) {
            throw err;
        }
    }
}

export default FollowingService;
