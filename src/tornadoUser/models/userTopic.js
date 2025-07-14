import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";

class UserTopic extends Model {}

UserTopic.init(
    {
        userId: {
            type: DataTypes.BIGINT,
            references: {
                model: "Users",
                key: "id",
            },
        },
        topicId: {
            type: DataTypes.BIGINT,
            references: {
                model: "Topics",
                key: "id",
            },
        },
        interestRate: {
            // To know what is the most interested topic for the user
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: false,
        },
    },
    {
        sequelize,
        createdAt: true,
        updatedAt: false,
    }
);

export default UserTopic;