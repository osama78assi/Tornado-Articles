const { Request, Response } = require("express");
const User = require("../../models/user");

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function getPreferredCategories(req, res, next) {
    try {
        const userId = req.userInfo.id;

        console.log('\n\n###########', userId, '\n\n###########')

        const categories = await User.getPreferredCategories(userId);

        return res.status(200).json({
            status: "success",
            data: categories,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = getPreferredCategories;
