import { Request, Response } from "express";
import OperationError from "../util/operationError";
import prettyError from "../util/prettyError";

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

export default errorHandler;
