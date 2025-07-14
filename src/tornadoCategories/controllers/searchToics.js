import TopicService from "../services/topicService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function searchToics(req, res, next) {
    try {
        // The difference here is the admin can see how many interested people in X category
        const { query, lastEntryTitle, limit } = req?.validatedQuery;

        const results = await TopicService.moderatorSearchTopics(
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

export default searchToics;
