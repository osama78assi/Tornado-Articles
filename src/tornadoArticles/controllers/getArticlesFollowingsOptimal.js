import RecommendationService from "../services/recommendationService.js";
import { modifyIgnore } from "../util/index.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getArticlesFollowingsOptimal(req, res, next) {
    try {
        // Check [followingData.validate.js, getOptimalArticles.validate.js] to know what are these fields
        const {
            firstPublisherId,
            lastPublisherId,
            lastPublisherRate,
            firstPublisherRate,
            followingsLimit,
            keepTheRange,
            articlesLimit,
            lastArticleRank,
            lastArticleId,
            ignore,
        } = req?.body;

        const { id } = req?.userInfo;

        // To know if the ignore list have motified. Return the index that we sliced from it
        const ignoreSlicedFrom = modifyIgnore(ignore);

        const data = await RecommendationService.getArticlesFollowingOptimal(
            id,
            firstPublisherId,
            lastPublisherId,
            lastPublisherRate,
            firstPublisherRate,
            followingsLimit,
            keepTheRange,
            articlesLimit,
            lastArticleRank,
            lastArticleId,
            ignore
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

export default getArticlesFollowingsOptimal;
