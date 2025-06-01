const { Request, Response } = require("express");
const ArticleService = require("../../dbServices/articleService");

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function getArticle(req, res, next) {
    try {
        const {articleId} = req?.params;

        const article = await ArticleService.getArticleDetails(articleId);

        if(article.dataValues.private) {
            return res.status(403).json({
                status: "error",
                message: "This article is private. You can't access it",
            })
        }

        return res.status(200).json({
            status: "success",
            data: article
        })

    } catch(err) {
        next(err);
    }
}

module.exports = getArticle;