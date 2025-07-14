import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";

class TopicCategory extends Model {}

TopicCategory.init(
    {
        categoryId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: "Categories",
                key: "id",
            },
        },
        topicId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: "Topics",
                key: "id",
            },
        },
    },
    {
        sequelize,
        timestamps: false,
    }
);

export default TopicCategory;
