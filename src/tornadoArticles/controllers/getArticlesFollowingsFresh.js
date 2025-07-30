import { modifyIgnore } from "../util/index.js";
import RecommendationService from "../services/recommendationService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getArticlesFollowingsFresh(req, res, next) {
    try {
        // Check [followignsData.validate.js, getFreshArticles.validate.js] know what are this fields
        const {
            lastArticleRank,
            lastArticleId,
            firstPublisherId,
            lastPublisherId,
            firstPublisherRate,
            lastPublisherRate,
            ignore,
            articlesLimit,
            keepTheRange,
            followingsLimit,
        } = req?.body;

        const { id } = req?.userInfo;

        // To know if the ignore list have motified. Return the index that we sliced from it
        const ignoreSlicedFrom = modifyIgnore(ignore);

        let data = await RecommendationService.getArticlesFollowingFresh(
            id,
            lastArticleRank,
            lastArticleId,
            firstPublisherId,
            lastPublisherId,
            firstPublisherRate,
            lastPublisherRate,
            ignore,
            articlesLimit,
            followingsLimit,
            keepTheRange
        );

        // The object interestRateRange for example. When its properites 'null' you can send a property if you want that there is no more artilces for current followings
        return res.status(200).json({
            success: true,
            data,
            ignoreSlicedFrom,
        });
    } catch (err) {
        next(err);
    }
}

export default getArticlesFollowingsFresh;
