import modifyIgnore from '../../../util/modifyIgnore.js';
import ArticleService from '../services/articleService.js';

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getArtilcesTopicOptimal(req, res, next) {
    try {
        // Check [preferenceData.validate.js, getOptimalArticles.validate.js] to know what are these fields
        const {
            firstInterestRate,
            lastInterestRate,
            firstEntryId: firstTopicId,
            lastEntryId: lastTopicId,
            preferenceLimit: topicsLimit,
            keepTheRange,
            articlesLimit,
            lastArticleRank,
            lastArticleId,
            ignore,
        } = req?.body;

        const { id } = req?.userInfo;

        // To know if the ignore list have motified. Return the index that we sliced from it
        const ignoreSlicedFrom = modifyIgnore(ignore);

        const data = await ArticleService.getArticlesTopicsOptimal(
            id,
            firstInterestRate,
            lastInterestRate,
            firstTopicId,
            lastTopicId,
            topicsLimit,
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

export default getArtilcesTopicOptimal;
