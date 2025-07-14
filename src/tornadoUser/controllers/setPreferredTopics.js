import removeDuplicated from "../../../util/removeDuplicated.js";
import UserPreferenceService from "../services/userPreferenceService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function setPreferredTopics(req, res, next) {
    try {
        let { data: topics } = req?.body;

        const userId = req.userInfo.id;

        // When user send same ID twice by mistake
        topics = removeDuplicated(topics);

        const topicsData = await UserPreferenceService.addPreferredTopics(
            userId,
            topics
        );

        return res.status(200).json({
            success: true,
            data: topicsData,
        });
    } catch (err) {
        next(err);
    }
}

export default setPreferredTopics;
