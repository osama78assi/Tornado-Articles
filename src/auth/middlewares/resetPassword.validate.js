import { object, string, ZodError } from "zod/v4";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import validatePassword from "../../../util/validatePassword.js";

class ErrorsEnum {
    static MISSING_DATA = new APIError(
        "Please provide both old password and new password",
        400,
        "MISSING_DATA"
    );

    static SAME_PASSED_PASSWORD = new APIError(
        "The passed old and new password is the same.",
        400,
        "SAME_PASSED_PASSWORD"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function resetPasswordValidate(req, res, next) {
    try {
        let { oldPassword = null, newPassword = null } = req?.body ?? {};

        if (oldPassword === null || newPassword === null)
            return next(ErrorsEnum.MISSING_DATA);

        // Define the schema of the body data
        const ResetPassSchema = object({
            oldPassword: string().trim(),
            newPassword: string().trim(),
        });

        // If something faild here it will throw an error
        req.body = ResetPassSchema.parse({
            oldPassword,
            newPassword,
        });

        // validate both. Reduce the invalid access to the password related controllers because it's expensive
        validatePassword(oldPassword);
        validatePassword(newPassword);

        // When they passed the same
        if (req.body.oldPassword === req.body.newPassword)
            return next(ErrorsEnum.SAME_PASSED_PASSWORD);

        next();
    } catch (err) {
        if (err instanceof ZodError && err.issues[0].code === "invalid_type") {
            return next(
                GlobalErrorsEnum.INVALID_DATATYPE(
                    err.issues[0].path[0],
                    err.issues[0].expected
                )
            );
        }
        next(err);
    }
}

export default resetPasswordValidate;
