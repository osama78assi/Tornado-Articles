import {
    ALLOWED_IGNORE_COUNT,
    MAX_CATEGORIES_ARTICLE_COUNT,
    MAX_RESULTS,
    MIN_RESULTS,
} from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import ArticleService from "../services/articleService.js";

class ErrorsEnum {
    static INVALID_CATEGORIES = new APIError(
        `The "catgeories" must be array contains ${MAX_CATEGORIES_ARTICLE_COUNT} categories maximum`,
        400,
        "INVALID_CATEGORIES"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getOptimalArticle(req, res, next) {
    try {
        // This Controller is meant for getting articles for Guests
        let {
            limit = MIN_RESULTS, // How many articles you want
            categories = [], // The categories he wants
            lastArticleRank = Number.POSITIVE_INFINITY, // This will be used by optimal articles
            lastArticleId = "", // To escape that id
            ignore = [], // To ignore articles that has been recommended
        } = req?.body ?? {};

        if (!Array.isArray(categories) && categories.length > 5)
            return next(ErrorsEnum.INVALID_CATEGORIES);

        if (limit <= 0 || limit > MAX_RESULTS)
            return next(GlobalErrorsEnum.INVALID_LIMIT);

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
