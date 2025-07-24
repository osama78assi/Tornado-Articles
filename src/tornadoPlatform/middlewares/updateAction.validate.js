import { object, string, ZodError } from "zod/v4";
import { MODERATOR_ACTIONS } from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import isNull from "../../../util/isNull.js";

class ErrorsEnum {
    static ONE_FIELD_REQUIRED = new APIError(
        "Provide one of these fields (reason, actionType, duration)",
        400,
        "MISSING_DATA"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function updateActionValidate(req, res, next) {
    try {
        const {
            actionType = undefined,
            duration = undefined,
            reason = undefined,
        } = req?.body ?? {};

        if (
            reason === undefined &&
            actionType === undefined &&
            duration === undefined
        )
            return next(ErrorsEnum.ONE_FIELD_REQUIRED);

        const Query = object({
            actionType: string().optional(),
            duration: string().nullable().optional(),
            reason: string().optional(),
        });

        Object.assign(
            req.body,
            Query.parse({
                actionType: actionType?.toLowerCase?.(),
                duration,
                reason,
            })
        );

        if (!isNull(actionType) && !MODERATOR_ACTIONS.includes(actionType))
            return next(GlobalErrorsEnum.UNRECOGNIZED_ACTION_TYPE);

        return next();
    } catch (err) {
        if (err instanceof ZodError && err.issues[0].code === "invalid_type")
            return next(
                GlobalErrorsEnum.INVALID_DATATYPE(
                    err.issues[0].path[0],
                    "string"
                )
            );

        next(err);
    }
}

export default updateActionValidate;
