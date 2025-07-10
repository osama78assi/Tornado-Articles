import ArticleService from "../services/articleService.js";

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

        const data = await ArticleService.getArticlesFollowingOptimal(
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
        });
    } catch (err) {
        next(err);
    }
}

export default getArticlesFollowingsOptimal;
