import { string, ZodError } from "zod/v4";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import validateFullName from "../../../util/validateFullName.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function changeNameValidate(req, res, next) {
    try {
        const { newName = null } = req?.body ?? {};

        if (newName === null)
            return next(GlobalErrorsEnum.MISSING_FIELD("name"));

        const Name = string().trim();

        req.body.newName = Name.parse(newName);

        // Valdiate the name
        validateFullName(req.body.newName);

        next();
    } catch (err) {
        if (err instanceof ZodError && err.issues[0].code === "invalid_type")
            return next(
                GlobalErrorsEnum.INVALID_DATATYPE(
                    "newName",
                    err.issues[0].expected
                )
            );
        next(err);
    }
}

export default changeNameValidate;
