import { string, ZodError } from "zod/v4";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function editBriefValidate(req, res, next) {
    try {
        const { newBrief = null } = req?.body ?? {};

        if (newBrief === null)
            return next(GlobalErrorsEnum.MISSING_FIELD("new brief"));

        const Brief = string();

        req.body.newBrief = Brief.parse(newBrief);

        next();
    } catch (err) {
        if (err instanceof ZodError && err.issues[0].code === "invalid_type")
            return next(
                GlobalErrorsEnum.INVALID_DATATYPE(
                    "newBrief",
                    err.issues[0].expected
                )
            );

        next(err);
    }
}

export default editBriefValidate;
