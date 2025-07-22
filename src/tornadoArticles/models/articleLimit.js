import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";

class ArticleLimit extends Model {}

ArticleLimit.init(
    {
        articleId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            references: {
                model: "Articles",
                key: "id",
            },
        },
        canUpdateTitleLangAt: {
            // Title got an index so update is slow it's a good idea to add limit for it
            // This also will be used in change language in the future
            type: DataTypes.DATE,
            allowNull: true,
        },
        canUpdateContentAt: {
            // Content can grow up to be 50K character length and there is some logic with images for update so this is (MAYBE) considered a Expensive operation
            type: DataTypes.DATE,
            allowNull: true,
        },
        canChangePreferencesAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        canChangeTagsAt: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    },
    {
        sequelize,
        timestamps: false,
    }
);

export default ArticleLimit;
