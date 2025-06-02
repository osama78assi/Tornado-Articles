const { sequelize } = require("../config/sequelize");
const { Model, DataTypes } = require("sequelize");

class CommentLike extends Model {}

CommentLike.init(
    {
        userId: {
            type: DataTypes.UUID,
            references: {
                model: "Users",
                key: "id",
            },
            onDelete: "CASCADE"
        },
        commentId: {
            type: DataTypes.BIGINT,
            references: {
                model: "Comments",
                key: "id",
            },
            onDelete: "CASCADE"
        },
    },
    {
        sequelize,
        timestamps: true,
        updatedAt: false,
        indexes: [
            {
                name: "comment_id_like_btree_index",
                fields: ["commentId", "createdAt"],
                using: "BTREE",
            },
        ],
    }
);

module.exports = CommentLike;
