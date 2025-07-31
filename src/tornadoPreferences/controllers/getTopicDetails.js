import TopicService from "../services/topicService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getTopicDetails(req, res, next) {
    try {
        const { topicId } = req?.params;

        const topic = await TopicService.getTopicDetails(topicId);

        return res.status(200).json({
            success: true,
            data: topic,
        });
    } catch (err) {
        next(err);
    }
}

export default getTopicDetails;
