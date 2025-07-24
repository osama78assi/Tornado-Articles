import { email, object, string, ZodError } from "zod/v4";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import { MODERATOR_ACTIONS } from "../../../config/settings.js";

class ErrorsEnum {
    static ALL_REQUIRED = new APIError(
        "Provide these fields (userId, userName, userEmail, reason, actionType)",
        400,
        "MISSISNG_DATA"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function publishActionValidate(req, res, next) {
    try {
        const {
            userId = null,
            userName = null,
            userEmail = null,
            actionType = null,
            duration = null,
            reason = null,
        } = req?.body ?? {};

        // TODO: when implements notifications notify the user

        // Chose what must not be null
        if (
            userId === null ||
            userName === null ||
            userEmail === null ||
            reason === null ||
            actionType === null
        )
            return next(ErrorsEnum.ALL_REQUIRED);

        const Query = object({
            userId: string().regex(/^\d+$/),
            userName: string(),
            userEmail: email().trim(),
            actionType: string(),
            duration: string().nullable(),
            reason: string(),
        });

        Object.assign(
            req.body,
            Query.parse({
                userId: String(userId),
                userName,
                userEmail,
                actionType: actionType?.toLowerCase?.(),
                duration,
                reason,
            })
        );

        if(!MODERATOR_ACTIONS.includes(actionType))
            return next(GlobalErrorsEnum.UNRECOGNIZED_ACTION_TYPE)

        if (email.length > 254) return next(GlobalErrorsEnum.TOO_LONG_EMAIL);

        return next();
    } catch (err) {
        if (err instanceof ZodError) {
            let code = err.issues[0].code;
            let path = err.issues[0].path[0];

            if (
                (code === "invalid_type" || code === "invalid_format") &&
                path === "userId"
            )
                return next(GlobalErrorsEnum.INVALID_BIGINT_ID("userId"));

            if (code === "invalid_type")
                return next(GlobalErrorsEnum.INVALID_DATATYPE(path, "string"));
        }
        next(err);
    }
}

export default publishActionValidate;
