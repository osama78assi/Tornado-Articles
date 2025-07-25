import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";

class UserCategory extends Model {}

UserCategory.init(
    {
        userId: {
            type: DataTypes.BIGINT,
            references: {
                model: "Users",
                key: "id",
            },
            primaryKey: true,
            onDelete: "CASCADE", // When user deletes his/her account. Delete the preferences
        },
        categoryId: {
            type: DataTypes.BIGINT,
            references: {
                model: "Categories",
                key: "id",
            },
            primaryKey: true,
            onDelete: "CASCADE", // When category get deleted. Delete the preferences
        },
        interestRate: {
            // To know what is the most interested category for the user
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

export default UserCategory;
