import { sequelize } from "../../../config/sequelize.js";
import { Model, DataTypes } from "sequelize";

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
            primaryKey: true,
        },
        image: {
            type: DataTypes.STRING(150),
            allowNull: false,
            primaryKey: true,
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
        noPrimaryKey: false // Don't allow sequlize add primary kay id
    }
);

// It create the id by itself and make it primary key while it's usless

export default ArticleImage;
