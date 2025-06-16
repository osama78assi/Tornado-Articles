import { MIN_RESULTS } from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import TornadoUserService from "../services/tornadoUserService.js";

class ErrorEnum {
    static FIELD_NOT_EXISTS = new APIError(
        "The field must be either `fullName` or `createAt`.",
        400,
        "INVALID_FIELD"
    );
    static WRONG_DIRECTION = new APIError(
        "The sort direction must be either ASC or DESC",
        400,
        "INVALID_DIRECTION"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function adminGetUsers(req, res, next) {
    try {
        const {
            offset = 0,
            limit = MIN_RESULTS,
            sortBy = "fullName",
            sortDir = "ASC",
        } = req?.query;

        if (!["ASC", "DESC"].includes(sortDir.toLocaleUpperCase()))
            return next(ErrorEnum.WRONG_DIRECTION);

        if (!["fullname", "createdat"].includes(sortBy.toLocaleLowerCase()))
            return next(ErrorEnum.FIELD_NOT_EXISTS);

        const currentId = req.userInfo.id;

        const users = await TornadoUserService.getUsersData(
            offset,
            limit,
            sortBy,
            sortDir,
            currentId
        );

        return res.status(200).json({
            success: true,
            data: users,
        });
    } catch (err) {
        next(err);
    }
}

export default adminGetUsers;
