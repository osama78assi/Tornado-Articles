import APIError from "../util/APIError.js";

/**
 *
 * This middleware should be called after authintacion middleware
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function isAdmin(req, res, next) {
    try {
        const { role } = req.userInfo;

        if (role !== "admin") {
            return next(new APIError("You aren't admin man !", 401));
        }
        // Pass to next middelware
        next();
    } catch (err) {
        next(err);
    }
}

export default isAdmin;
