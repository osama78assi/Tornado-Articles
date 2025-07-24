import ModeratorActionService from "../services/moderatorActionService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getActionsByUser(req, res, next) {
    try {
        const { lastEntryId, limit } = req?.validatedQuery;
        const { userId } = req?.params;

        const actions = await ModeratorActionService.getActions(
            lastEntryId,
            limit,
            userId
        );

        return res.status(200).json({
            success: true,
            data: actions,
            lastEntryId: actions?.at?.(-1)?.id ?? null, // Get last entry id or null when there is no more actions
        });
    } catch (err) {
        next(err);
    }
}

export default getActionsByUser;
