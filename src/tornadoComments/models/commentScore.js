import { sequelize } from "../../../config/sequelize.js";
import { Model, DataTypes } from "sequelize";

class CommentScore extends Model {}

CommentScore.init(
    {
        userId: {
            type: DataTypes.BIGINT,
            references: {
                model: "Users",
                key: "id",
            },
            onDelete: "CASCADE",
            primaryKey: false
        },
        commentId: {
            type: DataTypes.BIGINT,
            references: {
                model: "Comments",
                key: "id",
            },
            onDelete: "CASCADE",
            primaryKey: false
        },
    },
    {
        sequelize,
        timestamps: true,
        updatedAt: false,
        indexes: [
            {
                name: "comment_id_score_btree_index", // to get comments faster
                fields: ["commentId"],
                using: "BTREE",
            },
        ],
    }
);

export default CommentScore;
