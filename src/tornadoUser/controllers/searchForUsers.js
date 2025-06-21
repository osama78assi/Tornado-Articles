import { MAX_RESULTS, MIN_RESULTS } from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import TornadoUserService from "../services/tornadoUserService.js";

class ErrorsEnum {
    static INVALID_QUERY = new APIError(
        "Please provide user name to search.",
        400,
        "MISSING_USER_NAME"
    );

    static INVALID_DATE = new APIError(
        "The provided date for `entryItemDate` isn't formatted correctly.",
        400,
        "INVALID_DATE"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function searchForUsers(req, res, next) {
    try {
        let {
            query = null,
            getAfter = 1, // This will specify the order. forward and backward
            limit = MIN_RESULTS,
            entryItemDate = new Date().toISOString(),
        } = req?.query ?? {};

        if (query === null) return next(ErrorsEnum.INVALID_QUERY);

        if (new Date(entryItemDate) === "Invalid Date")
            return next(ErrorsEnum.INVALID_DATE);

        getAfter = Number(getAfter);

        if (![0, 1].includes(getAfter))
            return next(GlobalErrorsEnum.INVALID_DIRECTION);

        limit = Number(limit);

        if (limit <= 0 || limit > MAX_RESULTS)
            return next(GlobalErrorsEnum.INVALID_LIMIT);

        // If the current user is logged in we wanna remove his account from here
        let results = await TornadoUserService.searchByName(
            query,
            limit,
            entryItemDate,
            getAfter,
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
