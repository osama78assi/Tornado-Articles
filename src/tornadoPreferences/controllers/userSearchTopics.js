import TopicService from "../services/topicService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function userSearchTopics(req, res, next) {
    try {
        const { query, lastEntryTitle, limit } = req?.validatedQuery;

        const results = await TopicService.userSearchTopics(
            query,
            lastEntryTitle,
            limit
        );

        return res.status(200).json({
            success: true,
            data: results,
        });
    } catch (err) {
        next(err);
    }
}

export default userSearchTopics;
