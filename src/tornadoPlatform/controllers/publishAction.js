import ModeratorActionService from "../services/moderatorActionService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function publishAction(req, res, next) {
    try {
        const { userId, userName, userEmail, actionType, duration, reason } =
            req?.body;

        const action = await ModeratorActionService.publishAction(
            userId,
            userName,
            userEmail,
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

export default publishAction;
