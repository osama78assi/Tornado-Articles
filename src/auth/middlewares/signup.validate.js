import {
    date,
    object,
    string,
    email as zodEmail,
    enum as zodEnum,
    ZodError,
} from "zod/v4";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import validateFullName from "../../../util/validateFullName.js";
import validatePassword from "../../../util/validatePassword.js";

class ErrorsEnum {
    static INVALID_GENDER = new APIError(
        "Invalid gender. it must be either male or female",
        400,
        "VALIDATION_ERROR"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function signupValidate(req, res, next) {
    try {
        let {
            fullName = null,
            email = null,
            password = null,
            birthDate = null, // YYYY-MM-DD
            gender = null,
        } = req?.body ?? {};

        // Some validation
        if (fullName === null)
            return next(GlobalErrorsEnum.MISSING_FIELD("full name"));

        if (email === null)
            return next(GlobalErrorsEnum.MISSING_FIELD("email"));

        if (password === null)
            return next(GlobalErrorsEnum.MISSING_FIELD("password"));

        if (birthDate === null)
            return next(GlobalErrorsEnum.MISSING_FIELD("birth date"));

        if (gender === null)
            return next(GlobalErrorsEnum.MISSING_FIELD("gender"));

        // In expensive controllers I found it a goood idea to reject the access if I know that it will throw error later
        const SigninSchema = object({
            fullName: string().trim(),
            email: zodEmail().trim().max(254),
            password: string().trim(),
            birthDate: date(),
            gender: zodEnum(["male", "female"]),
        });

        req.body = SigninSchema.parse({
            fullName,
            email,
            password,
            birthDate: new Date(birthDate),
            gender: gender.trim().toLowerCase(),
        });

        validatePassword(req.body.password);
        validateFullName(req.body.fullName);

        next();
    } catch (err) {
        if (err instanceof ZodError) {
            const errToThrow = {
                too_big: GlobalErrorsEnum.TOO_LONG_EMAIL,
                invalid_format: GlobalErrorsEnum.INVALID_EMAIL_FORMAT,
                invalid_value: ErrorsEnum.INVALID_GENDER,
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

export default signupValidate;
