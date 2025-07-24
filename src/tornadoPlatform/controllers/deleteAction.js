import ModeratorActionService from '../services/moderatorActionService.js';

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function deleteAction(req, res, next) {
    try {
        const {actionId} = req?.params;

        // This will throw an error if not exists
        await ModeratorActionService.deleteAction(actionId);

        return res.status(200).json({
            success: true,
            message: "Action record deleted successfully"
        })
    } catch (err) {
        next(err);
    }
}

export default deleteAction;
