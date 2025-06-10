import { Request, Response } from "express";
import TornadoUserService from "../services/tornadoUserService";

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function deleteAccount(req, res, next) {
    try {
        const userId = req?.userInfo?.id;

        await TornadoUserService.deleteUser(userId);

        // Delete the token
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
        });

        return res.status(200).json({
            success: true,
            message: "Account deleted successfully.",
        });
    } catch (err) {
        next(err);
    }
}

export default deleteAccount;
