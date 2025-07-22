import ArticleService from "../services/articleService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function deleteArticle(req, res, next) {
    try {
        const { articleId } = req?.params;

        const { id: userId } = req?.userInfo;

        // If this article isn't for current authenticated user this will throw an error
        await ArticleService.isArticleForUser(articleId, userId);

        // Delete the article now
        await ArticleService.deleteArticle(articleId);

        return res.status(200).json({
            success: true,
            message: "Article deleted successfully",
        });
    } catch (err) {
        next(err);
    }
}

export default deleteArticle;
