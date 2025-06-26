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

    static INVALID_DATE = new APIError(
        "The passed 'since' must be a valid date",
        400,
        "INVALID_DATE"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getFreshArticles(req, res, next) {
    try {
        // This Controller is meant for getting articles for Guests
        let {
            limit = MIN_RESULTS, // How many articles you want
            since = new Date(), // default value current time
            categories = [], // The categories he wants
            ignore = [], // To ingore the articles that has been recommended
        } = req?.body ?? {};

        if (!Array.isArray(categories) && categories.length > 5)
            return next(ErrorsEnum.INVALID_CATEGORIES);

        if (new Date(since) == "Invalid Date")
            return next(ErrorsEnum.INVALID_DATE);

        if (limit <= 0 || limit > MAX_RESULTS)
            return next(GlobalErrorsEnum.INVALID_LIMIT);

        // To know if the ignore list have motified
        let entry = -1;
        
        // Extract last ALLOWED_IGNORE_COUNT if it's exceeded
        if(ignore.length > ALLOWED_IGNORE_COUNT) {
            // To get the entry point of slicing
            entry = Math.abs(ALLOWED_IGNORE_COUNT - ignore.length);
            ignore.splice(entry);
        }

        const articles = await ArticleService.getFreshArticles(
            limit,
            since,
            categories,
            ignore
        );

        // End the controller here
        return res.status(200).json({
            success: true,
            data: articles,
            modifiedEntry: entry
        });
    } catch (err) {
        next(err);
    }
}

export default getFreshArticles;
