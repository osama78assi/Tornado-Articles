import { sequelize } from "../../../config/sequelize";
import { Model, DataTypes } from "sequelize";

class ArticleCategory extends Model {}

// Both IDs are primary key because the article could have the category only once

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
            type: DataTypes.UUID,
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
