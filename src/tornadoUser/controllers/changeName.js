import APIError from "../../../util/APIError.js";
import TornadoUserService from "../services/tornadoUserService.js";

class ErrorEnum {
    static MISSING_NAME = new APIError(
        "Please provide the new name",
        400,
        "MISSING_NAME"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function changeName(req, res, next) {
    try {
        const { newName = null } = req?.body ?? {};
        // Get the id
        const userId = req?.userInfo.id;

        if (newName === null) return next(ErrorEnum.MISSING_NAME);

        const fullName = await TornadoUserService.updateUserName(
            userId,
            newName
        );

        return res.status(200).json({
            success: true,
            data: {
                fullName,
            },
        });
    } catch (err) {
        next(err);
    }
}

export default changeName;
