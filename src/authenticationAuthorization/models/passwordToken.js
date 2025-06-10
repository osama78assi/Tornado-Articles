import { sequelize } from "../../../config/sequelize";
import { Model, DataTypes } from "sequelize";

class PasswordToken extends Model {}

PasswordToken.init(
    {
        tokenId: {
            type: DataTypes.STRING(43), // SHA-265 of a token made by 32 bytes (encoded to hex string) 43
            primaryKey: true,
        },
        expiresAt: {
            type: DataTypes.DATE,
            defaultValue: new Date(Date.now() + 30 * 60 * 1000), // 30 min
            allowNull: false,
        },
        userId: {
            type: DataTypes.UUID,
            references: {
                model: "Users",
                key: "id",
            },
            allowNull: false,
            onDelete: "CASCADE",
        },
    },
    {
        sequelize,
        timestamps: false, // No need to createdAt and UpdatedAt
    }
);

export default PasswordToken;
