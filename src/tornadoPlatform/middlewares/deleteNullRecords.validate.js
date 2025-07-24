import { date, object, string, ZodError } from "zod/v4";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static INCORRECT_DECISION = new APIError(
        "Provide either 'pastDuration' to delete record for last passed duration. or both 'firstDate' and 'lastDate' to delete records between provided dates",
        400,
        "VALIDATION_ERRORs"
    );

    static INCORRECT_DATE_RANGE = new APIError(
        "Invalid date range. 'firstDate' must be less than 'secondDate'",
        400,
        "VALIDATION_ERROR"
    );

    static INVALID_DURATION = () => {
        const cachedErr = GlobalErrorsEnum.INVALID_DATATYPE(
            "pastDuration",
            "string"
        );

        cachedErr.additionalData.hint =
            "The duration may have spaces like '1 month' try to remove the space or check if it passed as URL Encoded. if you are using JavaScript URLSearchParams may help";
        return cachedErr;
    };

    static INVALID_DATE = (path) => {
        const cachedErr = GlobalErrorsEnum.INVALID_DATATYPE(path, "Date");

        cachedErr.additionalData.hint =
            `The ${path} must be string date. if you are using ISO date string check if it passed as URL Encoded. if you are using JavaScript URLSearchParams may help`;
        return cachedErr;
    };
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function deleteNullRecordsValidate(req, res, next) {
    try {
        // This route when the moderators want to clear the data from null userIDs
        // Or in another word the deleted user accounts

        // Maybe he want to delete reords for the last month. or maybe year. or now

        // First date and second date is to set a date range to delete all null records between them.
        // Note that the first must be less than second
        const {
            pastDuration = null,
            firstDate = null,
            secondDate = null,
        } = req?.query ?? {};

        // One decision accepted. Either pastDuration or both first and second date
        if (
            (pastDuration !== null &&
                (firstDate !== null || secondDate !== null)) ||
            (pastDuration === null &&
                (firstDate === null || secondDate === null))
        )
            return next(ErrorsEnum.INCORRECT_DECISION);

        const Query = object({
            pastDuration: string().nullable(),
            firstDate: date().nullable(),
            secondDate: date().nullable(),
        });

        req.validatedQuery = Query.parse({
            pastDuration,
            firstDate: new Date(firstDate),
            secondDate: new Date(secondDate),
        });

        // After correctly parsing the query. check if first and second is correct logically
        if (firstDate > secondDate)
            return next(ErrorsEnum.INCORRECT_DATE_RANGE);

        return next();
    } catch (err) {
        if (err instanceof ZodError) {
            let code = err.issues[0].code;
            let path = err.issues[0].path[0];

            if (code === "invalid_type" && path === "pastDuration")
                return next(ErrorsEnum.INVALID_DURATION());

            if (
                code === "invalid_type" &&
                ["firstDate", "secondDate"].includes(path)
            )
                return next(ErrorsEnum.INVALID_DATE(path));
        }
        next(err);
    }
}

export default deleteNullRecordsValidate;
