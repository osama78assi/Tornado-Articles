import ArticleService from "../services/articleService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getArticlesFollowingsFresh(req, res, next) {
    try {
        // This stage must run first `TODO: see the docs`
        const {
            since,
            lastPublisherId,
            firstPublisherRate,
            lastPublisherRate,
            ignore,
            limit,
        } = req?.body;

        const { id } = req?.userInfo;

        const data = await ArticleService.getArticlesFollowingFresh(
            id,
            since,
            lastPublisherId,
            firstPublisherRate,
            lastPublisherRate,
            ignore,
            limit
        );

        return res.status(200).json({
            success: true,
        });
    } catch (err) {
        next(err);
    }
}

export default getArticlesFollowingsFresh;
