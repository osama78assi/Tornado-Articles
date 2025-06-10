import { Request, Response } from "express";
import ArticleService from "../../services/articleService";

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function getArticle(req, res, next) {
    try {
        const { articleId } = req?.params;

        const article = await ArticleService.getArticleDetails(articleId);

        if (article.dataValues.private)
            return next(
                "This article is private. You can't access it",
                403,
                "PRIVATE_ARTICLE"
            );

        return res.status(200).json({
            success: true,
            data: article,
        });
    } catch (err) {
        next(err);
    }
}

export default getArticle;
