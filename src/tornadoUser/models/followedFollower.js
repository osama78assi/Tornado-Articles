import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";

class FollowedFollower extends Model {}

FollowedFollower.init(
    {
        followerId: {
            type: DataTypes.BIGINT,
            references: {
                model: "Users",
                key: "id",
            },
            onDelete: "CASCADE",
        },
        followedId: {
            type: DataTypes.BIGINT,
            references: {
                model: "Users",
                key: "id",
            },
            onDelete: "CASCADE",
        },
        interestRate: {
            // To know what is the most interested followings by the follower
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        updatedAt: false, // No need to updatedAt
        createdAt: true,
        indexes: [
            // {
            //
            //     name: "follower_id_follower_following_btree_index",
            //     fields: [
            //         { name: "followerId" },
            //         { name: "createdAt", order: "DESC" },
            //     ],
            //     using: "BTREE",
            // },
        ],
    }
);

export default FollowedFollower;
