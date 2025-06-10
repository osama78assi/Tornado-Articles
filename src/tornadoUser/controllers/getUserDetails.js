import { Request, Response } from "express";
import TornadoUserService from "../services/tornadoUserService";

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function getUserDetails(req, res, next) {
    try {
        const { userId } = req?.params || {};

        // get the details
        const user = await TornadoUserService.getUserDetails(userId);

        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (err) {
        next(err);
    }
}

export default getUserDetails;
