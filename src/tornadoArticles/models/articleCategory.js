import { sequelize } from "../../../config/sequelize.js";
import { Model, DataTypes } from "sequelize";

class ArticleCategory extends Model {}

ArticleCategory.init(
    {
        articleId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            references: {
                model: "Categories",
                key: "id",
            },
            onDelete: "CASCADE",
        },
        categoryId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            references: {
                model: "Articles",
                key: "id",
            },
            onDelete: "CASCADE",
        },
    },
    {
        sequelize,
        timestamps: false, // No need to createdAt and updatedAt
    }
);

export default ArticleCategory;
