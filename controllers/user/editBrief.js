const { Request, Response } = require("express");
const OperationError = require("../../util/operationError");
const User = require("../../models/user");

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function editBrief(req, res, next) {
    try {
        const { newBrief = null } = req?.body || {};
        const userId = req.userInfo.id;

        if (newBrief === null)
            return next(
                new OperationError(
                    "Please provide the new brief to edit it.",
                    400
                )
            );

        // To delete the brief just pass empty string
        await User.updateBrief(userId, newBrief === "" ? null : newBrief);

        return res.status(200).json({
            status: "success",
            data: {
                breif: newBrief === "" ? null : newBrief,
            },
        });
    } catch (err) {
        next(err);
    }
}

module.exports = editBrief;
