import { Request, Response } from "express";
import { MIN_RESULTS } from "../../../config/settings";
import FollowingService from "../services/followingService";

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function getFollowings(req, res, next) {
    try {
        const { userId } = req?.params;
        const { offset = 0, limit = MIN_RESULTS } = req?.query || {};

        const followings = await FollowingService.getFollowings(
            userId,
            offset,
            limit
        );

        return res.status(200).json({
            success: true,
            data: followings,
        });
    } catch (err) {
        next(err);
    }
}

export default getFollowings;
