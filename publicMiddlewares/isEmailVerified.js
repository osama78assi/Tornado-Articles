import APIError from "../util/APIError.js";

class ErrorsEnum {
    static EMAIL_NOT_VERIFIED = new APIError(
        "Please verify your email before taking this action",
        401,
        "EMAIL_NOT_VERIFIED"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function isEmailVerified(req, res, next) {
    try {
        // As this middleware must be called after isAuthenticated middleware
        const { verifiedEmail } = req?.userInfo;

        if (!verifiedEmail) return next(ErrorsEnum.EMAIL_NOT_VERIFIED);

        return next();
    } catch (err) {
        next(err);
    }
}

export default isEmailVerified;
