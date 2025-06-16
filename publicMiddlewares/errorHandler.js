import APIError from "../util/APIError.js";
import prettyError from "../util/prettyError.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function errorHandler(error, req, res, next) {
    if (error instanceof APIError) {
        res.status(error.statusCode).json({
            success: error.success,
            message: error.message,
            code: error.code
        });
    } else {
        console.log(error);
        if (process.env.NODE_ENV === "development") {
            res.status(500).json({
                success: false,
                ...error,
            });
        } else {
            const { status, obj } = prettyError(error);
            res.status(status).json(obj);
        }
    }
}

export default errorHandler;
