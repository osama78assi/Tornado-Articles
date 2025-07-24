import {
    boolean,
    date,
    literal,
    object,
    string,
    union,
    ZodError,
} from "zod/v4";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static ONE_FIELD_REQUIRED = new APIError(
        "Provide one of these fields at least (fullName, birthDate, gender, brief, allowCookies)",
        400,
        "MISSING_DATA"
    );

    static INVALID_GENDER = new APIError(
        "Gender can be either 'male' or 'female'",
        400,
        "VALIDATION_ERROR",
        [["hint", "remove the spaces from the beginning and end"]]
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function editUserValidate(req, res, next) {
    try {
        const {
            fullName = undefined,
            birthDate = undefined,
            gender = undefined,
            brief = undefined,
            allowCookies = undefined,
        } = req?.body ?? {};

        if (
            fullName === undefined &&
            birthDate === undefined &&
            gender === undefined &&
            brief === undefined &&
            allowCookies === undefined
        )
            return next(ErrorsEnum.ONE_FIELD_REQUIRED);

        const Query = object({
            fullName: string().optional(),
            birthDate: date().optional(),
            gender: union([literal("male"), literal("female")]).optional(),
            brief: string().nullable().optional(),
            allowCookies: boolean().optional(),
        });

        Object.assign(
            req.body,
            Query.parse({
                fullName,
                birthDate:
                    birthDate !== undefined ? new Date(birthDate) : undefined,
                gender: gender?.toLowerCase?.(),
                brief,
                allowCookies,
            })
        );

        if (req.body.gender !== undefined)
            req.body.gender = req.body.gender.toLowerCase();

        return next();
    } catch (err) {
        if (err instanceof ZodError) {
            let code = err.issues[0].code;
            let path = err.issues[0].path[0];
            let expected = err.issues[0].expected;

            if (code === "invalid_union" && path === "gender")
                return next(ErrorsEnum.INVALID_GENDER);

            if (code === "invalid_type" && path === "birthDate")
                return next(GlobalErrorsEnum.INVALID_BIRTH_DATE);

            if (code === "invalid_type")
                return next(GlobalErrorsEnum.INVALID_DATATYPE(path, expected));
        }
        next(err);
    }
}

export default editUserValidate;
