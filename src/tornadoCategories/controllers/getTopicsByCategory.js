import TopicService from "../services/topicService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getTopicsByCategory(req, res, next) {
    try {
        const { limit, entryItemTitle } = req?.validatedQuery;
        const { categoryId } = req?.params;

        const topics = await TopicService.getTopicsByCategory(
            entryItemTitle,
            limit,
            categoryId
        );

        return res.status(200).json({
            success: true,
            data: topics,
        });
    } catch (err) {
        next(err);
    }
}

export default getTopicsByCategory;
