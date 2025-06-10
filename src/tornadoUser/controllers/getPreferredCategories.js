import { Request, Response } from "express";
import { MIN_RESULTS } from "../../../config/settings";
import UserPreferenceService from "../services/userPreferenceService";

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function getPreferredCategories(req, res, next) {
    try {
        const userId = req.userInfo.id;

        const { offset = 0, limit = MIN_RESULTS } = req?.query || {};

        const categories = await UserPreferenceService.getPreferredCategories(
            userId,
            offset,
            limit
        );

        return res.status(200).json({
            success: true,
            data: categories,
        });
    } catch (err) {
        next(err);
    }
}

export default getPreferredCategories;
