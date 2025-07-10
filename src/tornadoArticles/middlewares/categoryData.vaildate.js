import { boolean, int, literal, object, string, union, ZodError } from "zod/v4";
import {
    ARTICLES_CATEGORIES_MAX_LIMIT,
    ARTICLES_CATEGORIES_MIN_LIMIT,
} from "../../../config/settings.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function categoryDataVaildate(req, res, next) {
    try {
        const {
            firstInterestRate = Number.POSITIVE_INFINITY, // First interest rate to make a range
            lastInterestRate = "0", // Last one to complete the range
            firstCategoryId = "9223372036854775807", // In case of interest rate the same we will rely on IDs
            lastCategoryId = "0", // To complete the range
            categoriesLimit = ARTICLES_CATEGORIES_MIN_LIMIT, // How many categories to get articles from
            keepTheRange = true, // Whether to keep the current range (or result range for initial request) or replace it
        } = req?.body ?? {};

        const Query = object({
            firstInterestRate: union([
                string().regex(/^\d+(\.{0,1}\d+)?$/),
                literal(Number.POSITIVE_INFINITY),
            ]),
            lastInterestRate: string().regex(/^\d+(\.{0,1}\d+)?$/),
            firstCategoryId: string().regex(/^\d+$/),
            lastCategoryId: string().regex(/^\d+$/),
            categoriesLimit: int(),
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
                firstCategoryId: String(firstCategoryId),
                lastCategoryId: String(lastCategoryId),
                categoriesLimit,
                keepTheRange,
            })
        );

        if (
            categoriesLimit < 1 ||
            categoryDataVaildate > ARTICLES_CATEGORIES_MAX_LIMIT
        )
            return next(
                GlobalErrorsEnum.INVALID_LIMIT(
                    "categoriesLimit",
                    ARTICLES_CATEGORIES_MIN_LIMIT
                )
            );

        return next();
    } catch (err) {
        if (err instanceof ZodError) {
            // Build this only once
            let commonErrObj = {
                categoriesLimit: GlobalErrorsEnum.INVALID_LIMIT(
                    "categoriesLimit",
                    ARTICLES_CATEGORIES_MAX_LIMIT
                ),
                lastInterestRate:
                    GlobalErrorsEnum.INVALID_FLOAT_NUMBER("lastInterestRate"),
                firstInterestRate:
                    GlobalErrorsEnum.INVALID_FLOAT_NUMBER("firstInterestRate"),
                firstCategoryId:
                    GlobalErrorsEnum.INVALID_BIGINT_ID("firstCategoryId"),
                lastCategoryId:
                    GlobalErrorsEnum.INVALID_BIGINT_ID("lastCategoryId"),
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

export default categoryDataVaildate;
