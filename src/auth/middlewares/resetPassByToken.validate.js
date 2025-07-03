import { string, ZodError } from "zod/v4";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import validatePassword from "../../../util/validatePassword.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function resetPassByTokenValidate(req, res, next) {
    try {
        let { newPassword = null } = req?.body ?? {};

        if (newPassword === null)
            return next(GlobalErrorsEnum.MISSING_FIELD("password"));

        const NewPassword = string().trim();

        newPassword = NewPassword.parse(newPassword)

        validatePassword(newPassword);

        req.body.newPassword = newPassword;
    } catch (err) {
        if (err instanceof ZodError && err.issues[0].code === "invalid_type") {
            return next(
                GlobalErrorsEnum.INVALID_DATATYPE(
                    "newPassword",
                    err.issues[0].expected
                )
            );
        }
        next(err);
    }
}

export default resetPassByTokenValidate;
