import sendDeleteArticleReason from "../../../services/sendDeleteArticleReason.js";
import TornadoUserService from "../../tornadoUser/services/tornadoUserService.js";
import ArticleService from "../services/articleService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function moderatorDeleteArticle(req, res, next) {
    try {
        const { articleId } = req?.params;
        const { userReason, reason, userId } = req?.body;

        // Get article details
        const article = await ArticleService.getArticleProps(articleId, [
            "title",
            "createdAt",
        ]);
        
        // Get user details
        const user = await TornadoUserService.getUserProps(userId, [
            "id",
            "email",
            "fullName",
        ]);

        // Delete the article without checking if it's belong to the user because this is MODERATOR
        await ArticleService.deleteArticle(articleId, user.id, user.email, user.fullName, reason);

        // TODO: send notification in Tornado platfrom

        sendDeleteArticleReason(
            {
                userEmail: user.dataValues.email,
                userName: user.dataValues.fullName,
            },
            {
                user: process.env.GOOGLE_EMAIL,
                pass: process.env.GOOGLE_APP_PASS,
            },
            {
                createdAt: article.dataValues.createdAt,
                title: article.dataValues.title,
                userReason,
            }
        );

        return res.status(200).json({
            successS: true,
            message: "Article deleted successfully",
        });
    } catch (err) {
        next(err);
    }
}

export default moderatorDeleteArticle;
