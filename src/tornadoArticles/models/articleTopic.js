import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";

class ArticleTopic extends Model {}

ArticleTopic.init(
    {
        topicId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            references: {
                model: "Articles",
                key: "id",
            },
            onDelete: "CASCADE",
        },
        articleId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            references: {
                model: "Categories",
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

export default ArticleTopic;