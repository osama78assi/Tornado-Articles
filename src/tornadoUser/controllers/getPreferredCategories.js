import { MAX_RESULTS, MIN_RESULTS } from "../../../config/settings.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import UserPreferenceService from "../services/userPreferenceService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getPreferredCategories(req, res, next) {
    try {
        const userId = req.userInfo.id;

        let {
            limit = MIN_RESULTS,
            entryItemTitle = "",
            getAfter = 1,
        } = req?.query || {};

        getAfter = Number(getAfter);

        if (![0, 1].includes(getAfter))
            return next(GlobalErrorsEnum.INVALID_DIRECTION);

        limit = Number(limit);

        if (limit <= 0 || limit > MAX_RESULTS)
            return next(GlobalErrorsEnum.INVALID_LIMIT);

        const categories = await UserPreferenceService.getPreferredCategories(
            userId,
            entryItemTitle,
            getAfter,
            limit
        );

        return res.status(200).json({
            success: true,
            data: categories,
        });
    } catch (err) {
        next(err);
    }
}

export default getPreferredCategories;
