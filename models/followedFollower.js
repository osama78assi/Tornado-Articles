const { sequelize } = require("../config/sequelize");
const { Model, DataTypes } = require("sequelize");
const OperationError = require("../helper/operationError");

class FollowedFollower extends Model {
    static async addFollower(followerId, followedId) {
        try {
            const data = await this.create({
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
            const affectedRows = await this.destroy({
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

FollowedFollower.init(
    {
        followerId: {
            type: DataTypes.UUID,
            references: {
                model: "Users",
                key: "id",
            },
        },
        followedId: {
            type: DataTypes.UUID,
            references: {
                model: "Users",
                key: "id",
            },
        },
    },
    {
        sequelize,
        timestamps: false, // No need to updatedAt nor createdAt
    }
);

module.exports = FollowedFollower;
