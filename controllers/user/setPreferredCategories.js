const { Request, Response } = require("express");
const OperationError = require("../../util/operationError");
const UserPreference = require("../../models/userPreference");
const removeDuplicated = require("../../util/removeDuplicated");

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function setPreferredCategories(req, res, next) {
    try {
        let { categories = null } = req?.body || {};

        const userId = req.userInfo.id;

        // When user try to add many categories if he repeated the same category.
        // A unique constraint error will be thrown not foriegn key violate
        categories = removeDuplicated(categories);

        if (categories === null)
            return next(
                new OperationError(
                    "Please provide the categories IDs you want to add as preferred.",
                    400
                )
            );

        const categoriesData = await UserPreference.addPreferredCategories(
            userId,
            categories
        );

        return res.status(200).json({
            status: "success",
            data: categoriesData,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = setPreferredCategories;
