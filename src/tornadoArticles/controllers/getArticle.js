import APIError from "../../../util/APIError.js";
import ArticleService from "../services/articleService.js";
import { canViewArticle } from "../util/index.js";

class ErrorsEnum {
    static PRIVATE_ARTICLE = new APIError(
        "This article is either private or has been deleted. You can't access it",
        403,
        "NOT_FOUND"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getArticle(req, res, next) {
    try {
        const { articleId } = req?.params;

        // If he is a guest
        const isGuest = req?.isGuest;
        let userId = null;
        let userRole = null;

        // When he isn't a guest there is a userId
        if (!isGuest) {
            ({ id: userId, role: userRole } = req?.userInfo);
        }

        const article = await ArticleService.getArticleDetails(articleId);

        // When it's private and the user can't see the article (he is normal user)
        // now when he is a guest that condition will fall so you can ignore that. in the end if he is a user
        // check the IDs
        if (
            article.dataValues.private &&
            !canViewArticle(userRole) &&
            (isGuest || article.dataValues.userId !== userId)
        )
            return next(ErrorsEnum.PRIVATE_ARTICLE);

        return res.status(200).json({
            success: true,
            data: article,
        });
    } catch (err) {
        next(err);
    }
}

export default getArticle;
