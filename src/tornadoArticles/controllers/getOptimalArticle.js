import { ALLOWED_IGNORE_COUNT } from "../../../config/settings.js";
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
            lastArticleRank,
            lastArticleId,
            ignore,
        } = req?.body;

        // To know if the ignore list have motified
        let entry = -1;

        // Extract last ALLOWED_IGNORE_COUNT if it's exceeded
        if (ignore.length > ALLOWED_IGNORE_COUNT) {
            // To get the entry point of slicing
            entry = Math.abs(ALLOWED_IGNORE_COUNT - ignore.length);
            ignore.splice(entry);
        }

        // Get optimal articles
        const articles = await ArticleService.getOptimalArticles(
            limit,
            categories,
            lastArticleId,
            lastArticleRank,
            ignore
        );

        return res.status(200).json({
            success: true,
            data: articles,
            modifiedEntry: entry,
        });
    } catch (err) {
        next(err);
    }
}

export default getOptimalArticle;
