const { sequelize } = require("../config/sequelize");
const { Model, DataTypes } = require("sequelize");

class ArticleImage extends Model {}

ArticleImage.init(
    {
        articleId: {
            type: DataTypes.BIGINT,
            references: {
                model: "Articles",
                key: "id",
            },
            onDelete: "CASCADE",
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
    },
    {
        sequelize,
        timestamps: false,
        indexes: [
            {
                name: "article_id_articles_images_btree_index",
                fields: ["articleId"],
                using: "BTREE",
            },
        ],
    }
);

// It create the id by itself and make it primary key while it's usless
ArticleImage.removeAttribute("id");

module.exports = ArticleImage;
