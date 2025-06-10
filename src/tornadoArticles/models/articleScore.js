import { sequelize } from "../config/sequelize";
import { Model, DataTypes } from "sequelize";

class ArticleScore extends Model {}

// Both IDs are primary key because the article could only one like from the user

ArticleScore.init(
    {
        articleId: {
            type: DataTypes.BIGINT,
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
        updatedAt: false, // score will never be updated
        // indexes: [
        //     {
        //         // Fast for getting the likes by article id (and sorted by created at)
        //         name: "article_id_like_btree_index",
        //         fields: [
        //             { name: "articleId" },
        //         ],
        //         using: "BTREE",
        //     },
        // ],
    }
);

export default ArticleScore;
