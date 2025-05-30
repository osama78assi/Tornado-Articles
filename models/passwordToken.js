const { sequelize } = require("../config/sequelize");
const { Model, DataTypes } = require("sequelize");
const OperationError = require("../helper/operationError");

class PasswordToken extends Model {
    static async createToken(userId, tokenId) {
        try {
            const passToken = await this.create({
                tokenId,
                userId,
            });

            return passToken;
        } catch (err) {
            throw err;
        }
    }

    static async getTokenById(tokenId) {
        try {
            const passwordToken = await this.findByPk(tokenId);

            if (passwordToken === null)
                throw new OperationError(
                    "There is no token with that ID.",
                    404
                );

            return passwordToken;
        } catch (err) {
            throw err;
        }
    }

    static async deleteTokenById(tokenId) {
        try {
            const affectedRows = await this.destroy({ where: { tokenId } });

            if (affectedRows === 0)
                throw new OperationError(
                    "Couldn't delete the token or it doesn't exist.",
                    500
                );

            return affectedRows;
        } catch (err) {
            throw err;
        }
    }
}

PasswordToken.init(
    {
        tokenId: {
            type: DataTypes.STRING(45), // SHA-265 of a token made by 32 bytes (encoded to hex string) 43 is enough but for safety 45
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
        },
    },
    {
        sequelize,
        timestamps: false, // No need to createdAt and UpdatedAt
    }
);

module.exports = PasswordToken;
