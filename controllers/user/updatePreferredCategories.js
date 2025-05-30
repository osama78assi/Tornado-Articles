const { Request, Response } = require("express");
const OperationError = require("../../helper/operationError");
const User = require("../../models/user");
const removeDuplicated = require("../../helper/removeDuplicated");
const UserPreference = require("../../models/userPreference");

class ErrorEnum {
    static EMPTY_DATA = new OperationError(
        "Please provide either categories to add. Or categories to delete.",
        400
    );

    static INVALID_DATA_TYPE = new OperationError(
        "toAdd or toDelete must be arrays.",
        400
    );
}

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function updatePreferredCategories(req, res, next) {
    try {
        let { toDelete = [], toAdd = [] } = req?.body || {};

        const userId = req.userInfo.id;

        if (toAdd.length === 0 && toDelete.length === 0)
            return next(ErrorEnum.EMPTY_DATA);

        if (Array.isArray(toAdd) && Array.isArray(toDelete))
            return next(ErrorEnum.INVALID_DATA_TYPE);

        // Same reason to get meaningful error message
        toDelete = removeDuplicated(toDelete);
        toAdd = removeDuplicated(toAdd);

        await UserPreference.updatePreferredCategories(userId, toAdd, toDelete);

        return res.status(200).json({
            status: "success",
            message: "Preferred categoires edited successfully.",
        });
    } catch (err) {
        next(err);
    }
}

module.exports = updatePreferredCategories;
