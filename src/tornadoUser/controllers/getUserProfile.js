import TornadoUserService from "../services/tornadoUserService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getUserProfile(req, res, next) {
    try {
        const { userId } = req?.params;

        // get the details
        const user = await TornadoUserService.getUserDetails(userId);

        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (err) {
        next(err);
    }
}

export default getUserProfile;
