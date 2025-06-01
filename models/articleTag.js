const { sequelize } = require("../config/sequelize");
const { Model, DataTypes } = require("sequelize");

class ArticleTag extends Model {}

ArticleTag.init(
    {
        articleId: {
            type: DataTypes.UUID,
            references: {
                model: "Articles",
                key: "id",
            },
            onDelete: "CASCADE",
        },
        tagId: {
            type: DataTypes.UUID,
            references: {
                model: "Tags",
                key: "id",
            },
        },
    },
    {
        sequelize,
        timestamps: false,
    }
);

module.exports = ArticleTag;
