const { sequelize } = require("../config/sequelize");
const { Model, DataTypes } = require("sequelize");

class Notification extends Model {}

Notification.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        content: {
            type: DataTypes.STRING(255), // More than enough
            allowNull: false,
        },
        url: {
            type: DataTypes.STRING(250), // URL for a comment or post
            allowNull: false,
        },
        isRead: {
            type: DataTypes.BOOLEAN,
        },
        userId: {
            type: DataTypes.UUID,
            references: {
                model: "Users",
                key: "id",
            },
            unique: false,
            allowNull: false,
        },
    },
    {
        sequelize,
        timestamps: true,
        updatedAt: false, // Notification will never be updated
        indexes: [
            {
                // Fast for getting notification by user id and sorted by created at
                name: "userId_notifiaction_btree_index",
                fields: ["userId", "createdAt"],
                using: "BTREE",
            },
        ],
    }
);

module.exports = Notification;
