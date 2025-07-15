import modifyIgnore from "../../../util/modifyIgnore.js";
import ArticleService from "../services/articleService.js";

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

        const articles = await ArticleService.getFreshArticles(
            limit,
            since,
            lastArticleId,
            categories,
            topics,
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

export default getFreshArticles;
