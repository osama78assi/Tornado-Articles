const { sequelize } = require("../config/sequelize");
const { Model, DataTypes } = require("sequelize");

class CommentScore extends Model {}

CommentScore.init(
    {
        userId: {
            type: DataTypes.UUID,
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

module.exports = CommentScore;
