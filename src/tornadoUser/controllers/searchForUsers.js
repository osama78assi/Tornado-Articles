import { MIN_RESULTS } from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import TornadoUserService from "../services/tornadoUserService.js";

class ErrorEnum {
    static INVALID_QUERY = new APIError(
        "Please provide user name to search.",
        400,
        "MISSING_USER_NAME"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function searchForUsers(req, res, next) {
    try {
        const {
            query = null,
            offset = 0,
            limit = MIN_RESULTS,
        } = req?.query || {};

        if (query === null) return next(ErrorEnum.INVALID_QUERY);

        // If the current user is logged in we wanna remove his account from here
        let results = await TornadoUserService.searchByName(
            query,
            limit,
            offset,
            req?.userInfo?.id || null
        );

        return res.status(200).json({
            success: true,
            data: results,
        });
    } catch (err) {
        next(err);
    }
}

export default searchForUsers;
