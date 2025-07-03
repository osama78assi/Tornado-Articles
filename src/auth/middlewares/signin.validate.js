import { object, string, email as zodEmail, ZodError } from "zod/v4";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import validatePassword from "../../../util/validatePassword.js";

class ErrorsEnum {
    static MISSING_DATA = new APIError(
        "Please provide both email and password.",
        400,
        "MISSING_DATA"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function signinValidate(req, res, next) {
    try {
        let { email = null, password = null } = req?.body ?? {};

        if (email === null || password === null)
            return next(ErrorsEnum.MISSING_DATA);

        const SigninSchema = object({
            email: zodEmail().trim().max(254),
            password: string().trim(),
        });

        req.body = SigninSchema.parse({ email, password });

        // If password is string this will be called. if it's invalid this will throw an error
        validatePassword(req.body.password);

        next();
    } catch (err) {
        if (err instanceof ZodError) {
            // To reduce nest and annoying if statements
            const errToThrow = {
                too_big: GlobalErrorsEnum.TOO_LONG_EMAIL,
                invalid_format: GlobalErrorsEnum.INVALID_EMAIL_FORMAT,
            };

            let code = err.issues[0].code;
            let path = err.issues[0].path[0];
            let expected = err.issues[0].expected;

            if (code === "invalid_type")
                return next(GlobalErrorsEnum.INVALID_DATATYPE(path, expected));

            if (errToThrow[code]) return next(errToThrow[code]);
        }

        next(err);
    }
}

export default signinValidate;
