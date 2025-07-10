import { ZodError, email } from "zod/v4";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function deleteAccountValidate(req, res, next) {
    try {
        // Check if the email provided first
        const { userEmail = null } = req?.body ?? {};

        if (userEmail === null)
            return next(GlobalErrorsEnum.MISSING_FIELD("email"));

        // Define the schema
        const Email = email(userEmail).trim().max(254);

        req.body.userEmail = Email.parse(userEmail);

        next();
    } catch (err) {
        if (err instanceof ZodError && errorToThrow[code]) {
            // To reduce nested if
            const errorToThrow = {
                too_big: GlobalErrorsEnum.TOO_LONG_EMAIL,
                invalid_type: (field, type) =>
                    GlobalErrorsEnum.INVALID_DATATYPE(field, type),
                invalid_format: GlobalErrorsEnum.INVALID_EMAIL_FORMAT,
            };

            let code = err.issues[0].code;

            if (code === "invalid_type")
                return next(errorToThrow.invalid_type(
                    "userEmail",
                    err.issues[0].expected
                ));

            return next(errorToThrow[code]);
        }
        next(err);
    }
}

export default deleteAccountValidate;
