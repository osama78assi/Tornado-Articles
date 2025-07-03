import TornadoUserService from "../services/tornadoUserService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function editBrief(req, res, next) {
    try {
        const { newBrief } = req?.body;
        const userId = req.userInfo.id;

        // To delete the brief just pass empty string
        const brief = await TornadoUserService.updateBrief(
            userId,
            newBrief === "" ? null : newBrief
        );

        return res.status(200).json({
            success: true,
            data: {
                brief,
            },
        });
    } catch (err) {
        next(err);
    }
}

export default editBrief;
