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

    static MISSING_DATA = new APIError(
        "These fields are required (fullName, email, password, birthDate, gender)",
        400,
        "MISSING_DATA"
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
        if (
            fullName === null ||
            email === null ||
            password === null ||
            birthDate === null ||
            gender === null
        )
            return next(ErrorsEnum.MISSING_DATA);

        // In expensive controllers I found it a goood idea to reject the access if I know that it will throw error later
        const SigninSchema = object({
            fullName: string().trim(),
            email: zodEmail().trim().max(254),
            password: string().trim(),
            birthDate: date(),
            gender: zodEnum(["male", "female"]),
        });

        Object.assign(
            req.body,
            SigninSchema.parse({
                fullName,
                email,
                password,
                birthDate: birthDate !== null ? new Date(birthDate) : null,
                gender: gender.trim().toLowerCase(),
            })
        );

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

            if (code === "invalid_type" && path === "birthDate")
                return next(GlobalErrorsEnum.INVALID_BIRTH_DATE);

            if (code === "invalid_type")
                return next(GlobalErrorsEnum.INVALID_DATATYPE(path, expected));

            if (errToThrow[code]) return next(errToThrow[code]);
        }

        next(err);
    }
}

export default signupValidate;
