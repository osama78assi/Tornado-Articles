import { boolean, int, literal, object, string, union, ZodError } from "zod/v4";
import {
    ARTICLES_CATEGORIES_MAX_LIMIT,
    ARTICLES_TOPICS_MAX_LIMIT,
    ARTICLES_TOPICS_MIN_LIMIT,
    MAX_RESULTS,
    MIN_RESULTS,
} from "../../../config/settings.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function preferenceDataVaildate(req, res, next) {
    // Again to know if topics or categories by catetgories
    const url = req?.url;
    let defPreferenceLimit = MIN_RESULTS; // Default MAX_RESULTS
    let defMax = MAX_RESULTS;

    let entryName = "entry";
    if (url.includes("topic")) {
        entryName = "(topic)";

        // Change the values
        defPreferenceLimit = ARTICLES_TOPICS_MIN_LIMIT;
        defMax = ARTICLES_TOPICS_MAX_LIMIT;
    } else if (url.includes("categories")) {
        entryName = "(category)";

        // Change the values
        defPreferenceLimit = ARTICLES_TOPICS_MIN_LIMIT;
        defMax = ARTICLES_TOPICS_MAX_LIMIT;
    }

    try {
        const {
            firstInterestRate = Number.POSITIVE_INFINITY, // First interest rate to make a range
            lastInterestRate = "0", // Last one to complete the range
            firstEntryId = "9223372036854775807", // In case of interest rate the same we will rely on IDs
            lastEntryId = "0", // To complete the range
            preferenceLimit = defPreferenceLimit, // How many (categories|topics) to get articles from
            keepTheRange = true, // Whether to keep the current range (or result range for initial request) or replace it
        } = req?.body ?? {};

        const Query = object({
            firstInterestRate: union([
                string().regex(/^\d+(\.{0,1}\d+)?$/),
                literal(Number.POSITIVE_INFINITY),
            ]),
            lastInterestRate: string().regex(/^\d+(\.{0,1}\d+)?$/),
            firstEntryId: string().regex(/^\d+$/),
            lastEntryId: string().regex(/^\d+$/),
            preferenceLimit: int(),
            keepTheRange: boolean(),
        });

        Object.assign(
            req.body,
            Query.parse({
                firstInterestRate:
                    firstInterestRate !== Number.POSITIVE_INFINITY
                        ? String(firstInterestRate)
                        : firstInterestRate,
                lastInterestRate: String(lastInterestRate),
                firstEntryId: String(firstEntryId),
                lastEntryId: String(lastEntryId),
                preferenceLimit,
                keepTheRange,
            })
        );

        if (preferenceLimit < 1 || preferenceDataVaildate > defMax)
            return next(
                GlobalErrorsEnum.INVALID_LIMIT("preferenceLimit", defMax)
            );

        return next();
    } catch (err) {
        if (err instanceof ZodError) {
            // Build this only once
            let commonErrObj = {
                preferenceLimit: GlobalErrorsEnum.INVALID_LIMIT(
                    "preferenceLimit",
                    ARTICLES_CATEGORIES_MAX_LIMIT
                ),
                lastInterestRate:
                    GlobalErrorsEnum.INVALID_FLOAT_NUMBER("lastInterestRate"),
                firstInterestRate:
                    GlobalErrorsEnum.INVALID_FLOAT_NUMBER("firstInterestRate"),
                firstEntryId:
                    GlobalErrorsEnum.INVALID_BIGINT_ID(`firstEntryId ${entryName}`),
                lastEntryId: GlobalErrorsEnum.INVALID_BIGINT_ID(`lastEntryId ${entryName}`),
                keepTheRange: GlobalErrorsEnum.INVALID_DATATYPE(
                    "keepTheRange",
                    "boolean"
                ),
            };

            let errToThrow = {
                invalid_type: commonErrObj, // This will take the reference no copy here
                invalid_format: commonErrObj, // Same here
            };

            let code = err.issues[0].code;
            let path = err.issues[0].path[0];

            if (code === "invalid_union")
                return next(errToThrow.invalid_type.firstInterestRate);

            if (errToThrow[code][path]) return next(errToThrow[code][path]);
        }
        next(err);
    }
}

export default preferenceDataVaildate;
