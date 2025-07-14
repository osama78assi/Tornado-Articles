import removeDuplicated from "../../../util/removeDuplicated.js";
import UserPreferenceService from "../services/userPreferenceService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function removePreferredTopics(req, res, next) {
    try {
        let { data: topics } = req?.body;

        const userId = req.userInfo.id;

        // Same reason to get meaningful error message
        topics = removeDuplicated(topics);

        await UserPreferenceService.removePreferredTopics(userId, topics);

        return res.status(200).json({
            success: true,
            message: "Topics removed from your preferred topics successfully.",
        });
    } catch (err) {
        next(err);
    }
}

export default removePreferredTopics;
