const { sequelize } = require("../config/sequelize");
const { Model, DataTypes } = require("sequelize");

class FollowedFollower extends Model {}

FollowedFollower.init(
    {
        followerId: {
            type: DataTypes.UUID,
            references: {
                model: "Users",
                key: "id",
            },
            onDelete: "CASCADE",
        },
        followedId: {
            type: DataTypes.UUID,
            references: {
                model: "Users",
                key: "id",
            },
            onDelete: "CASCADE",
        },
    },
    {
        sequelize,
        updatedAt: false, // No need to updatedAt
        createdAt: true,
        indexes: [
            {
                // This will help in recommendation system (get the following for certain user)
                fields: [
                    { name: "followerId" },
                    { name: "createdAt", order: "DESC" },
                ],
                name: "follower_id_follower_following_btree_index",
                using: "BTREE",
            },
        ],
    }
);

module.exports = FollowedFollower;
