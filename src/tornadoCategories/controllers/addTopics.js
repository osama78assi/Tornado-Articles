import TopicService from "../services/topicService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function addTopics(req, res, next) {
    try {
        const { topics } = req?.body;

        const data = await TopicService.addTopics(topics);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (err) {
        next(err);
    }
}

export default addTopics;
