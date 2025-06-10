import { sequelize } from "../config/sequelize";
import { Model, DataTypes } from "sequelize";

class ArticleTag extends Model {}

ArticleTag.init(
    {
        articleId: {
            type: DataTypes.BIGINT,
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

export default ArticleTag;
