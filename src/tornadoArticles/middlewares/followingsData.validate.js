import { boolean, int, literal, object, string, union, ZodError } from "zod/v4";
import {
    ARTICLES_FOLLOWINGS_MAX_LIMIT,
    ARTICLES_FOLLOWINGS_MIN_LIMIT,
} from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";


/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function followingsDataValidate(req, res, next) {
    try {
        const {
            firstPublisherId = "9223372036854775807", // (it will be helpfull when there is two followers have the same interest rate)
            lastPublisherId = "0", // (it will be helpfull when there is two followers have the same interest rate)
            lastPublisherRate = "0", // As we get the most interested publisher for current user we need last publisher rate also
            firstPublisherRate = Number.POSITIVE_INFINITY, // To make a range
            followingsLimit = ARTICLES_FOLLOWINGS_MIN_LIMIT, // To know how many followings you want to pick
            keepTheRange = true, // Wether to change the followings or keep them
        } = req?.body ?? {};

        const Query = object({
            firstPublisherId: string().regex(/^\d+$/),
            lastPublisherId: string().regex(/^\d+$/),
            lastPublisherRate: union([string().regex(/^\d+(\.{0,1}\d+)?$/)]),
            firstPublisherRate: union([
                string().regex(/^\d+(\.{0,1}\d+)?$/),
                literal(Number.POSITIVE_INFINITY),
            ]),
            followingsLimit: int(),
            keepTheRange: boolean(),
        });

        Object.assign(
            req.body,
            Query.parse({
                firstPublisherId: String(firstPublisherId),
                lastPublisherId: String(lastPublisherId),
                firstPublisherRate:
                    firstPublisherRate !== Number.POSITIVE_INFINITY
                        ? String(firstPublisherRate)
                        : firstPublisherRate,

                lastPublisherRate: String(lastPublisherRate),
                followingsLimit,
                keepTheRange,
            })
        );

        if (
            followingsLimit < 1 ||
            followingsLimit > ARTICLES_FOLLOWINGS_MAX_LIMIT
        )
            return next(GlobalErrorsEnum.INVALID_LIMIT("followingsLimit", ARTICLES_FOLLOWINGS_MAX_LIMIT));

        return next();
    } catch (err) {
        if (err instanceof ZodError) {
            let errToThrow = {
                invalid_type: {
                    firstPublisherId:
                        GlobalErrorsEnum.INVALID_BIGINT_ID("firstPublisherId"),
                    lastArticleId:
                        GlobalErrorsEnum.INVALID_BIGINT_ID("lastArticleId"),
                    keepTheRange: GlobalErrorsEnum.INVALID_DATATYPE(
                        "keepTheRange",
                        "boolean"
                    ),
                },
                invalid_format: {
                    firstPublisherId:
                        GlobalErrorsEnum.INVALID_BIGINT_ID("firstPublisherId"),
                    lastPublisherId:
                        GlobalErrorsEnum.INVALID_BIGINT_ID("lastPublisherId"),
                },
                invalid_union: {
                    lastPublisherRate:
                        GlobalErrorsEnum.INVALID_FLOAT_NUMBER("lastPublisherRate"),
                    firstPublisherRate:
                        GlobalErrorsEnum.INVALID_FLOAT_NUMBER("firstPublisherRate"),
                },
            };

            let code = err?.issues[0].code;
            let path = err?.issues[0].path[0];
            if (errToThrow[code][path]) return next(errToThrow[code][path]);
        }
        next(err);
    }
}

export default followingsDataValidate;
