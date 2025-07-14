import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";

class ArticleScore extends Model {}

// The order of IDs matter here
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
            type: DataTypes.BIGINT,
            references: {
                model: "Users",
                key: "id",
            },
            onDelete: "SET NULL",
        },
    },
    {
        sequelize,
        timestamps: true,
        updatedAt: false, // score will never be updated
        indexes: [
            //     {
            //         // Fast for getting the likes by article id (and sorted by created at)
            //         name: "article_id_like_btree_index",
            //         fields: [
            //             { name: "articleId" },
            //         ],
            //         using: "BTREE",
            //     },
        ],
    }
);

export default ArticleScore;
