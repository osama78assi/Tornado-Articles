import { Op } from "sequelize";
import APIError from "../../../util/APIError.js";
import generateDateBefore from "../../../util/generateDateBefore.js";
import EmailToken from "../models/EmailToken.js";
import UserLimit from "../models/userLimit.js";

class ErrorsEnum {
    static NO_TOKEN = new APIError(
        "The code you've entered isn't correct. Or it's expired",
        400,
        "INCORRECT_CODE"
    );
}

class EmailTokenService {
    static async createToken(userId, tokenId) {
        try {
            const token = await EmailToken.create({
                userId,
                tokenId,
            });

            return token;
        } catch (err) {
            throw err;
        }
    }

    static async invalidAllTokens(userId) {
        try {
            await EmailToken.update(
                {
                    expiresAt: new Date(
                        Date.now() - +process.env.EMAIL_TOKEN_LIFE_TIME
                    ),
                },
                {
                    where: {
                        userId,
                    },
                }
            );
        } catch (err) {
            throw err;
        }
    }

    static async getValidTokenCounts(userId) {
        try {
            const validTokensCounts = await EmailToken.count({
                where: {
                    userId,
                    expiresAt: {
                        [Op.gte]: generateDateBefore("7 hours"), // Threshold to get the tokens even expired before 7 hours
                    },
                },
            });

            return validTokensCounts;
        } catch (err) {
            throw err;
        }
    }

    static async banGenerateEmailCodeTill(userId, banTill) {
        try {
            await UserLimit.update(
                {
                    canVerifyEmailAt: banTill,
                },
                {
                    where: {
                        userId,
                    },
                }
            );
        } catch (err) {
            throw err;
        }
    }

    static async getToken(token) {
        try {
            const data = await EmailToken.findByPk(token);

            if (data === null) throw ErrorsEnum.NO_TOKEN;

            return data;
        } catch (err) {
            throw err;
        }
    }

    static async destoryTokens(userId) {
        try {
            const deletedRows = await EmailToken.destroy({
                where: {
                    userId,
                },
            });

            return deletedRows;
        } catch (err) {
            throw err;
        }
    }
}

export default EmailTokenService;
