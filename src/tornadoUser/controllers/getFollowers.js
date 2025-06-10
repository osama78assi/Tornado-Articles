import { Request, Response } from "express";
import { MIN_RESULTS } from "../../../config/settings";
import FollowingService from "../services/followingService";

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function getFollowers(req, res, next) {
    try {
        const { userId } = req?.params;

        const { offset = 0, limit = MIN_RESULTS } = req?.query || {};

        const followers = await FollowingService.getFollowers(
            userId,
            offset,
            limit
        );

        return res.status(200).json({
            success: true,
            data: followers,
        });
    } catch (err) {
        next(err);
    }
}

export default getFollowers;
