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
                // This will help in recommendation system (get the following for current user)
                // And the sorted by createdAt to get a portion of followings
                // but get rid of OFFSET and depend on natural order by the following time
                // this also provide more content-management like user can prefere more followings
                // over other (yeah more storage than natural order of sorted id for primary keys but let's get over with)
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
