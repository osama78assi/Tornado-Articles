import TornadoUserService from "../services/tornadoUserService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function searchForUsers(req, res, next) {
    try {
        let { query, getAfter, limit, entryItemDate } = req?.validatedQuery;

        // If the current user is logged in we wanna remove his account from here
        let results = await TornadoUserService.searchByName(
            query,
            limit,
            entryItemDate,
            getAfter,
            req?.userInfo?.id || null
        );

        return res.status(200).json({
            success: true,
            data: results,
        });
    } catch (err) {
        next(err);
    }
}

export default searchForUsers;
