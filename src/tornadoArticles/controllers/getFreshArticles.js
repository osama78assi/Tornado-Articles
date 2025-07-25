import { modifyIgnore } from "../util/index.js";
import RecommendationService from "../services/recommendationService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getFreshArticles(req, res, next) {
    try {
        let {
            articlesLimit: limit,
            since,
            categories,
            topics,
            lastArticleId,
            ignore,
        } = req?.body;

        // To know if the ignore list have motified. Return the index that we sliced from it
        const ignoreSlicedFrom = modifyIgnore(ignore);

        const articles = await RecommendationService.getFreshArticles(
            limit,
            since,
            lastArticleId,
            categories,
            topics,
            ignore
        );

        // Extract some info for more API friendly. if these are null then no more articles
        let details = {
            lastArticleId:
                articles.length > 0 ? articles.at(-1)?.dataValues?.id : null,
            since:
                articles.length > 0
                    ? articles.at(-1)?.dataValues?.createdAt
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

export default getFreshArticles;
