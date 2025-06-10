import { Request, Response } from "express";
import { MIN_RESULTS } from "../../../../config/settings";
import ArticleService from "../../services/articleService";

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function getArticles(req, res, next) {
    try {
        const {
            limit = MIN_RESULTS,
            since = new Date().toISOString(), // default value current time for the server
            reducedTimes = null,
            lastPublisher = null,
        } = req?.query;

        // 1. If this is first time requesting then I don't have lastPublisher
        if (lastPublisher === null) {
            const articles = await ArticleService.getLatestArticlesGuests(
                limit,
                since
            );

            return res.status(200).json({
                success: true,
                data: articles,
            });
        }

        // 2. There is a last publisher id
    } catch (err) {
        next(err);
    }
}

export default getArticles;
