const { Request, Response } = require("express");
const { MIN_RESULTS } = require("../../config/settings");
const ArticleService = require("../../dbServices/articleService");

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function getArticles(req, res, next) {
    try {
        const {offset=0, limit=MIN_RESULTS} = req?.query;

        const articles = await ArticleService.getLatestArticles(offset, limit);

        return res.status(200).json({
            status: "success",
            data: articles
        })
    } catch(err) {
        next(err);
    }
}

module.exports = getArticles;