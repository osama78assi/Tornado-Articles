import { Request, Response } from "express";
import { MIN_RESULTS } from "../../../config/settings";
import OperationError from "../../../util/operationError";
import TornadoUserService from "../services/tornadoUserService";

class ErrorEnum {
    static FIELD_NOT_EXISTS = new OperationError(
        "The field must be either `fullName` or `createAt`.",
        400,
        "INVALID_FIELD"
    );
    static WRONG_DIRECTION = new OperationError(
        "The sort direction must be either ASC or DESC",
        400,
        "INVALID_DIRECTION"
    );
}

/**
 *
 * @param {Request} req
 * @param {Response} res
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
