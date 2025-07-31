import TopicService from "../services/topicService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function deleteTopics(req, res, next) {
    try {
        const { topicId } = req?.params;

        await TopicService.deleteTopic(topicId);

        return res.status(200).json({
            success: true,
            message: "Topics have been deleted successfully",
        });
    } catch (err) {
        next(err);
    }
}

export default deleteTopics;
