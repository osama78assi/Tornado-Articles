import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";

class UserPreference extends Model {}

UserPreference.init(
    {
        userId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            references: {
                model: "Users",
                key: "id",
            },
            primaryKey: true,
            onDelete: "CASCADE", // When user deletes his/her account. Delete the preferences
        },
        categoryId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            references: {
                model: "Categories",
                key: "id",
            },
            primaryKey: true,
            onDelete: "CASCADE", // When user deletes his/her account. Delete the preferences
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

export default UserPreference;
