import TopicService from "../services/topicService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getPreferredTopics(req, res, next) {
    try {
        const { entryInterestedCounts, entryItemTitle, limit } =
            req.validatedQuery;

        const topics = await TopicService.getPreferredTopics(
            entryItemTitle,
            entryInterestedCounts,
            limit
        );

        return res.status(200).json({
            success: true,
            data: topics,
        });
    } catch (err) {
        next(err);
    }
}

export default getPreferredTopics;
