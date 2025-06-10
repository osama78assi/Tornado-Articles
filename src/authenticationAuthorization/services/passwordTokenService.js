import OperationError from "../../../util/operationError";
import { create, destroy, findByPk } from "../models/passwordToken";

class ErrorEnums {
    static NO_TOKEN = new OperationError(
        "There is no token with that ID.",
        404,
        "TOKEN_NOT_FOUND"
    );

    static NO_TOKEN_TO_DELETE = new OperationError(
        "Couldn't delete the token or it doesn't exist.",
        500,
        "TOKEN_NOT_FOUND"
    );

    static;
}

class PasswordTokenService {
    static async createToken(userId, tokenId) {
        try {
            const passToken = await create({
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
            const passwordToken = await findByPk(tokenId);

            if (passwordToken === null) throw ErrorEnums.NO_TOKEN;

            return passwordToken;
        } catch (err) {
            throw err;
        }
    }

    static async deleteTokenById(tokenId) {
        try {
            const affectedRows = await destroy({
                where: { tokenId },
            });

            if (affectedRows === 0) throw ErrorEnums.NO_TOKEN_TO_DELETE;

            return affectedRows;
        } catch (err) {
            throw err;
        }
    }
}

export default PasswordTokenService;
