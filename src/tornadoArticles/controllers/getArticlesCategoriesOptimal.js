import modifyIgnore from "../../../util/modifyIgnore.js";
import RecommendationService from "../services/recommendationService.js";


/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getArticlesCategoriesOptimal(req, res, next) {
    try {
        // Check [preferenceData.validate.js, getOptimalArticles.validate.js] to know what are these fields
        const {
            firstInterestRate,
            lastInterestRate,
            firstEntryId: firstCategoryId,
            lastEntryId: lastCategoryId,
            preferenceLimit: categoriesLimit,
            keepTheRange,
            articlesLimit,
            lastArticleRank,
            lastArticleId,
            ignore,
        } = req?.body;

        const { id } = req?.userInfo;

        // To know if the ignore list have motified. Return the index that we sliced from it
        const ignoreSlicedFrom = modifyIgnore(ignore);

        const data = await RecommendationService.getArticlesCategoriesOptimal(
            id,
            firstInterestRate,
            lastInterestRate,
            firstCategoryId,
            lastCategoryId,
            categoriesLimit,
            lastArticleRank,
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

export default getArticlesCategoriesOptimal;
