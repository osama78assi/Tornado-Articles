import ArticleService from "../services/articleService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getArticlesCategoriesFresh(req, res, next) {
    try {
        // Check [categoriesData.validate.js, getFreshArticles.validate.js] to know what are these fields
        const {
            firstInterestRate,
            lastInterestRate,
            firstCategoryId,
            lastCategoryId,
            categoriesLimit,
            since,
            lastArticleId,
            ignore,
            articlesLimit,
            keepTheRange,
        } = req?.body;

        const { id } = req?.userInfo;

        const data = await ArticleService.getArticlesCategoriesFresh(
            id,
            firstInterestRate,
            lastInterestRate,
            firstCategoryId,
            lastCategoryId,
            categoriesLimit,
            since,
            lastArticleId,
            ignore,
            articlesLimit,
            keepTheRange
        );

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (err) {
        next(err);
    }
}

export default getArticlesCategoriesFresh;
