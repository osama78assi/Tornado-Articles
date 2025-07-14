import TopicService from "../services/topicService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getAllTopics(req, res, next) {
    try {
        const { limit, entryItemTitle } = req?.validatedQuery;

        const topics = await TopicService.getTopics(entryItemTitle, limit);

        return res.status(200).json({
            success: true,
            data: topics,
        });
    } catch (err) {
        next(err);
    }
}

export default getAllTopics;
