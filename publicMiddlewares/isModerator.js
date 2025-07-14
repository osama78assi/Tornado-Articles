import APIError from "../util/APIError.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function isModerator(req, res, next) {
    try {
        const { role } = req?.userInfo;

        // What moderator can do. The admin can do
        if (!["admin", "moderator"].includes(role))
            return next(
                new APIError(
                    "You can't access this resourse",
                    401,
                    "UNAUTHORIZED"
                )
            );

        return next();
    } catch (err) {
        next(err);
    }
}

export default isModerator;
