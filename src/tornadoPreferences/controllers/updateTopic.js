import TopicService from "../services/topicService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function updateTopic(req, res, next) {
    try {
        const { topicId } = req?.params;
        const { title, description } = req?.body;

        const topicData = await TopicService.updateTopic(topicId, title, description);

        return res.status(200).json({
            success: true,
            data: topicData,
        });
    } catch (err) {
        next(err);
    }
}

export default updateTopic;
