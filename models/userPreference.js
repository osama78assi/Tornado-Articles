const { sequelize } = require("../config/sequelize");
const { Model, DataTypes } = require("sequelize");
const Category = require("./category");

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
    },
    {
        sequelize,
        timestamps: false,
    }
);

// Just to be able to get the categories from junction table
UserPreference.belongsTo(Category, {
    foreignKey: "categoryId",
});

module.exports = UserPreference;
