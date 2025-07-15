import modifyIgnore from "../../../util/modifyIgnore.js";
import ArticleService from "../services/articleService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getOptimalArticle(req, res, next) {
    try {
        let {
            articlesLimit: limit, // rename it
            categories,
            topics,
            lastArticleRank,
            lastArticleId,
            ignore,
        } = req?.body;

        // To know if the ignore list have motified
        const ignoreSlicedFrom = modifyIgnore(ignore);

        // Get optimal articles
        const articles = await ArticleService.getOptimalArticles(
            limit,
            categories,
            topics,
            lastArticleId,
            lastArticleRank,
            ignore
        );

        return res.status(200).json({
            success: true,
            data: articles,
            ignoreSlicedFrom,
        });
    } catch (err) {
        next(err);
    }
}

export default getOptimalArticle;
