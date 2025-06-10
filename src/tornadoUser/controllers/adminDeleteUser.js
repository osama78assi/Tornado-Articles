import { Request, Response } from "express";
import OperationError from "../../../util/operationError";
import TornadoUserService from "../services/tornadoUserService";

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function adminDeleteUser(req, res, next) {
    try {
        const { userId } = req?.params;

        const currentId = req.userInfo.id;

        if (userId === currentId)
            return next(
                new OperationError(
                    "Are you serious ? you are the admin how can I delete you ?",
                    400,
                    "ILLEGAL_OPERATION"
                )
            );

        // This step is dangerous operation you can add extra comfirm like sending the password or user name
        await TornadoUserService.deleteUser(userId);

        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (err) {
        next(err);
    }
}

export default adminDeleteUser;
