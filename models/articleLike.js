const { sequelize } = require("../config/sequelize");
const { Model, DataTypes } = require("sequelize");

class ArticleLike extends Model {}

// Both IDs are primary key because the article could only one like from the user

ArticleLike.init(
    {
        articleId: {
            type: DataTypes.UUID,
            references: {
                model: "Articles",
                key: "id",
            },
            onDelete: "CASCADE",
        },
        userId: {
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
        timestamps: true,
        updatedAt: false, // Like will never be updated
        indexes: [
            {
                // Fast for getting the likes by article id (and sorted by created at)
                name: "article_id_like_btree_index",
                fields: ["articleId", "createdAt"],
                using: "BTREE",
            },
        ],
    }
);

module.exports = ArticleLike;
