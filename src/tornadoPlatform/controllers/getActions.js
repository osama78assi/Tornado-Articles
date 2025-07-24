import ModeratorActionService from "../services/moderatorActionService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getActions(req, res, next) {
    try {
        const { lastEntryId, limit } = req?.validatedQuery;

        const actions = await ModeratorActionService.getActions(
            lastEntryId,
            limit
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

export default getActions;
