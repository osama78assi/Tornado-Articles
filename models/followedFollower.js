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
            onDelete: "CASCADE"
        },
        followedId: {
            type: DataTypes.UUID,
            references: {
                model: "Users",
                key: "id",
            },
            onDelete: "CASCADE"
        },
    },
    {
        sequelize,
        timestamps: false, // No need to updatedAt nor createdAt
    }
);

module.exports = FollowedFollower;
