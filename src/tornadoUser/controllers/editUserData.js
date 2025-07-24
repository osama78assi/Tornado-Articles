import TornadoUserService from "../services/tornadoUserService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function editUserData(req, res, next) {
    try {
        const { fullName, birthDate, gender, brief, allowCookies } = req?.body;
        const userId = req.userInfo.id;

        await TornadoUserService.updateUserData(
            userId,
            fullName,
            gender,
            birthDate,
            brief,
            allowCookies
        );

        return res.status(200).json({
            success: true,
            message: "Update user data successfully"
        })
    } catch (err) {
        next(err);
    }
}

export default editUserData;
