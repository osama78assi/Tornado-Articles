const PasswordToken = require("../models/passwordToken");
const OperationError = require("../util/operationError");

class ErrorEnums {
    static NO_TOKEN = new OperationError(
        "There is no token with that ID.",
        404
    );

    static NO_TOKEN_TO_DELETE = new OperationError(
        "Couldn't delete the token or it doesn't exist.",
        500
    );

    static;
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

    static async deleteTokenById(tokenId) {
        try {
            const affectedRows = await PasswordToken.destroy({
                where: { tokenId },
            });

            if (affectedRows === 0) throw ErrorEnums.NO_TOKEN_TO_DELETE;

            return affectedRows;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = PasswordTokenService;
