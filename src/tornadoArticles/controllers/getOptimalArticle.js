import modifyIgnore from "../../../util/modifyIgnore.js";
import RecommendationService from "../services/recommendationService.js";

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
        const articles = await RecommendationService.getOptimalArticles(
            limit,
            categories,
            topics,
            lastArticleId,
            lastArticleRank,
            ignore
        );

        // Extract some info for more API friendly. if these are null then no more articles
        let details = {
            lastArticleId:
                articles.length > 0 ? articles.at(-1)?.dataValues?.id : null,
            lastArticleRank:
                articles.length > 0
                    ? String(articles.at(-1)?.dataValues?.articleRank)
                    : null,
        };

        return res.status(200).json({
            success: true,
            data: articles,
            ...details,
            ignoreSlicedFrom,
        });
    } catch (err) {
        next(err);
    }
}

export default getOptimalArticle;
