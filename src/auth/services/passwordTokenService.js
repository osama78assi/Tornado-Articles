import APIError from "../../../util/APIError.js";
import PasswordToken from "../models/passwordToken.js";

class ErrorEnums {
    static NO_TOKEN = new APIError(
        "There is no token with that ID.",
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

    static async deleteTokenById(tokenId) {
        try {
            const affectedRows = await PasswordToken.destroy({
                where: { tokenId },
            });

            return affectedRows;
        } catch (err) {
            throw err;
        }
    }
}

export default PasswordTokenService;
