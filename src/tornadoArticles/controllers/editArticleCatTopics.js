import { MAX_CATEGORIES_ARTICLE_COUNT, MAX_TOPICS_ARTICLE_COUNT } from "../../../config/settings.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import ArticleService from "../services/articleService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function editArticleCatTopics(req, res, next) {
    try {
        const {
            categories = [],
            topics = [],
        } = req?.body;

        // Take user Id to check who is the editor. Only publisher are allowed to do that
        const { id } = req?.userInfo;
        const { articleId } = req?.params;

        // Check if the user have this article. This will throw an error if it's not for the user
        const article = await ArticleService.isArticleForUser(articleId, id);

        // Now when the article is null meaning the article with id isn't existed
        if (article === null)
            return next(GlobalErrorsEnum.ARTICLE_NOT_FOUND(articleId));

        await ArticleService.updateArticleCategoriesTopics(
            articleId,
            categories,
            topics,
        );

        // Terminate the controller here
        return res.status(200).json({
            success: true,
            message: "Article's topics and/or categories updated successfully",
        });
    } catch (err) {
        next(err);
    }
}

export default editArticleCatTopics;
