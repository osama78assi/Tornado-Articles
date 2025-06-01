const { Request, Response } = require("express");
const OperationError = require("../util/operationError");
const prettyError = require("../util/prettyError");

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
function errorHandler(error, req, res, next) {
    if (error instanceof OperationError) {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
        });
    } else {
        console.log(error);
        if (process.env.NODE_ENV === "development") {
            res.status(500).json({
                status: "error",
                ...error,
            });
        } else {
            const { status, obj } = prettyError(error);
            res.status(status).json(obj);
        }
    }
}

module.exports = errorHandler;
