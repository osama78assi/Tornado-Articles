import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";

class EmailToken extends Model {}

EmailToken.init(
    {
        tokenId: {
            type: DataTypes.STRING(43), // SHA-256 (base64url encoded)
            primaryKey: true,
        },
        userId: {
            type: DataTypes.BIGINT,
            references: {
                model: "Users",
                key: "id",
            },
            allowNull: false,
            onDelete: "CASCADE",
        },
        expiresAt: {
            type: DataTypes.DATE,
            defaultValue: () =>
                new Date(Date.now() + +process.env.EMAIL_TOKEN_LIFE_TIME), // 30 min in my case. Make sure it's milliseconds
            allowNull: false,
        },
    },
    {
        sequelize,
        timestamps: false, // No need to createdAt and UpdatedAt
    }
);

export default EmailToken;