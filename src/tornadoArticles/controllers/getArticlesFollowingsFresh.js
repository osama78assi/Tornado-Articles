import ArticleService from "../services/articleService.js";


/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getArticlesFollowingsFresh(req, res, next) {
    try {
        // Check [followignsData.validate.js, getFreshArticles.validate.js] know what are this fields
        const {
            since,
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

        let data = await ArticleService.getArticlesFollowingFresh(
            id,
            since,
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
        });
    } catch (err) {
        next(err);
    }
}

export default getArticlesFollowingsFresh;
