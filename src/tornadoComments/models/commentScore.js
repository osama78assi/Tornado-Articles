import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";

class CommentScore extends Model {}

// The order of the columns matter here. CommentId is more important than userId. Because I will find the scores for comments
// by the comment id for example (maybe I will do denormalize later for faster queries)
CommentScore.init(
    {
        commentId: {
            type: DataTypes.BIGINT,
            references: {
                model: "Comments",
                key: "id",
            },
            onDelete: "CASCADE",
            primaryKey: false,
        },
        userId: {
            type: DataTypes.BIGINT,
            references: {
                model: "Users",
                key: "id",
            },
            onDelete: "CASCADE",
            primaryKey: false,
        },
    },
    {
        sequelize,
        timestamps: true,
        updatedAt: false,
    }
);

export default CommentScore;
