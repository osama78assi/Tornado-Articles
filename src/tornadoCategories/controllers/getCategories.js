import { MAX_RESULTS, MIN_RESULTS } from "../../../config/settings.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import CategoryService from "../services/categoryService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getCategories(req, res, next) {
    try {
        let {
            limit = MIN_RESULTS,
            entryItemTitle = "",
            getAfter = 1,
        } = req?.query;

        getAfter = Number(getAfter);

        if (![0, 1].includes(getAfter))
            return next(GlobalErrorsEnum.INVALID_DIRECTION);

        limit = Number(limit);

        // You can change the behavior as you want. More strict more better
        if (limit <= 0 || limit > MAX_RESULTS)
            return next(GlobalErrorsEnum.INVALID_LIMIT);

        const categories = await CategoryService.getCategories(
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

export default getCategories;
