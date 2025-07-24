import ModeratorActionService from "../services/moderatorActionService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function updateAction(req, res, next) {
    try {
        // This endpoint can use the same validator for publishing an action
        const { actionType, duration, reason } = req?.body;

        const { actionId } = req?.params;

        const action = await ModeratorActionService.updateAction(
            actionId,
            actionType,
            duration,
            reason
        );

        return res.status(200).json({
            success: true,
            data: action,
        });
    } catch (err) {
        next(err);
    }
}

export default updateAction;
