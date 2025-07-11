import { Op } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";
import APIError from "../../../util/APIError.js";
import generateDateBefore from "../../../util/generateDateBefore.js";
import PasswordToken from "../models/passwordToken.js";

class ErrorEnums {
    static NO_TOKEN = new APIError(
        "There is no token with that ID. Or it's expired",
        404,
        "PASSWORD_TOKEN_NOT_FOUND"
    );
}

class PasswordTokenService {
    static async createToken(userId, tokenId) {
        try {
            const passToken = await PasswordToken.create({
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
            const passwordToken = await PasswordToken.findByPk(tokenId);

            if (passwordToken === null) throw ErrorEnums.NO_TOKEN;

            return passwordToken;
        } catch (err) {
            throw err;
        }
    }

    static async deleteTokensById(tokenId) {
        try {
            // There is a possibility that the user generated many tokens so delete all of them
            const data = await PasswordToken.findByPk(tokenId, {
                attributes: ["userId"],
            });

            let affectedRows = null;

            if (data !== null) {
                // Delete all of them
                affectedRows = await PasswordToken.destroy({
                    where: { userId: data.dataValues.userId },
                });
            }

            return affectedRows;
        } catch (err) {
            throw err;
        }
    }

    static async getValidTokenCounts(userId) {
        try {
            const validTokensCount = await PasswordToken.count({
                where: {
                    userId,
                    expiresAt: {
                        [Op.gte]: generateDateBefore("7 hours"), // Threshold to get the tokens even expired before 7 hours
                    },
                },
            });

            return validTokensCount;
        } catch (err) {
            throw err;
        }
    }

    static async invalidateTokens(userId) {
        try {
            // Make the time back 31 minutes
            const affectedRows = await PasswordToken.update(
                {
                    expiresAt: sequelize.literal(
                        `"expiresAt" - INTERVAL '31 minutes' `
                    ),
                },
                {
                    where: {
                        userId,
                        expiresAt: {
                            [Op.gte]: new Date(),
                        },
                    },
                }
            );

            return affectedRows;
        } catch (err) {
            throw err;
        }
    }
}

export default PasswordTokenService;
