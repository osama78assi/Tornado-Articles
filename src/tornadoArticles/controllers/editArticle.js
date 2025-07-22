import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import ArticleService from "../services/articleService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function editArticle(req, res, next) {
    try {
        // See editArticle.validate.js to know what are these fields
        // Set to null becuase some of them maybe undefined
        const {
            isPrivate,
            minsToRead,
            language,
            title,
            headline,
        } = req?.body;

        // Take user Id to check who is the editor. Only publisher are allowed to do that
        const { id } = req?.userInfo;
        const { articleId } = req?.params;

        // Check if the user have this article. This will throw an error if it's not for the user
        const article = await ArticleService.isArticleForUser(articleId, id);

        // Now when the article is null meaning the article with id isn't existed
        if (article === null)
            return next(GlobalErrorsEnum.ARTICLE_NOT_FOUND(articleId));

        await ArticleService.updateArticle(
            articleId,
            isPrivate,
            minsToRead,
            language,
            title,
            headline
        );

        return res.status(200).json({
            success: true,
            message: "Article updated successfully",
        });
    } catch (err) {
        next(err);
    }
}

export default editArticle;
