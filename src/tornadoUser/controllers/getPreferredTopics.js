import UserPreferenceService from '../services/userPreferenceService.js';

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getPreferredTopics(req, res, next) {
    try {
        const userId = req.userInfo.id;

        let { limit, entryItemName, getAfter } = req?.validatedQuery;

        const topics = await UserPreferenceService.getPreferredTopics(
            userId,
            entryItemName,
            getAfter,
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
