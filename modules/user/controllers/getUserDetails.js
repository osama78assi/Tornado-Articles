const { Request, Response } = require("express");
const UserService = require("../../../dbServices/userService");

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function getUserDetails(req, res, next) {
    try {
        const { userId } = req?.params || {};

        // get the details
        const user = await UserService.getUserDetails(userId);

        return res.status(200).json({
            status: "success",
            data: user,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = getUserDetails;
