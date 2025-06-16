import APIError from "../../../util/APIError.js";
import TornadoUserService from "../services/tornadoUserService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function editBrief(req, res, next) {
    try {
        const { newBrief = null } = req?.body || {};
        const userId = req.userInfo.id;

        if (newBrief === null)
            return next(
                new APIError(
                    "Please provide the new brief to edit it.",
                    400,
                    "MISSING_BRIEF"
                )
            );

        // To delete the brief just pass empty string
        await TornadoUserService.updateBrief(
            userId,
            newBrief === "" ? null : newBrief
        );

        return res.status(200).json({
            success: true,
            data: {
                breif: newBrief === "" ? null : newBrief,
            },
        });
    } catch (err) {
        next(err);
    }
}

export default editBrief;
