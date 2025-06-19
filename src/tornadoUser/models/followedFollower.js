import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";

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
                name: "follower_id_follower_following_btree_index",
                fields: [
                    { name: "followerId" },
                    { name: "createdAt", order: "DESC" },
                ],
                using: "BTREE",
            },
        ],
    }
);

export default FollowedFollower;
