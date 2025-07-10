import ArticleService from "../services/articleService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getArticlesCategoriesOptimal(req, res, next) {
    try {
        // Check [categoriesData.validate.js, getOptimalArticles.validate.js] to know what are these fields
        const {
            firstInterestRate,
            lastInterestRate,
            firstCategoryId,
            lastCategoryId,
            categoriesLimit,
            keepTheRange,
            articlesLimit,
            lastArticleRank,
            lastArticleId,
            ignore,
        } = req?.body;

        const { id } = req?.userInfo;

        const data = await ArticleService.getArticlesCategoriesOptimal(
            id,
            firstInterestRate,
            lastInterestRate,
            firstCategoryId,
            lastCategoryId,
            categoriesLimit,
            lastArticleRank,
            lastArticleId,
            ignore,
            articlesLimit,
            keepTheRange
        );

        return res.status(200).json({
            success: true,
            data
        })
    } catch (err) {
        next(err);
    }
}

export default getArticlesCategoriesOptimal;
