import RecommendationService from "../services/recommendationService.js";
import { modifyIgnore } from "../util/index.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getArticlesCategoriesFresh(req, res, next) {
    try {
        // Check [preferenceData.validate.js, getFreshArticles.validate.js] to know what are these fields
        const {
            firstInterestRate,
            lastInterestRate,
            firstEntryId: firstCategoryId,
            lastEntryId: lastCategoryId,
            preferenceLimit: categoriesLimit,
            since,
            lastArticleId,
            ignore,
            articlesLimit,
            keepTheRange,
        } = req?.body;

        const { id } = req?.userInfo;

        // To know if the ignore list have motified. Return the index that we sliced from it
        const ignoreSlicedFrom = modifyIgnore(ignore);

        const data = await RecommendationService.getArticlesCategoriesFresh(
            id,
            firstInterestRate,
            lastInterestRate,
            firstCategoryId,
            lastCategoryId,
            categoriesLimit,
            since,
            lastArticleId,
            ignore,
            articlesLimit,
            keepTheRange
        );

        return res.status(200).json({
            success: true,
            data,
            ignoreSlicedFrom,
        });
    } catch (err) {
        next(err);
    }
}

export default getArticlesCategoriesFresh;
