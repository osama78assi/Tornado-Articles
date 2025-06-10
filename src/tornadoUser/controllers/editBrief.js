import { Request, Response } from "express";
import OperationError from "../../../util/operationError";
import TornadoUserService from "../services/tornadoUserService";

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
