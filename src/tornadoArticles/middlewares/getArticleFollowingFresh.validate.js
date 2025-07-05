import {
    array,
    date,
    int,
    literal,
    object,
    string,
    union,
    ZodError,
} from "zod/v4";
import { MAX_RESULTS, MIN_RESULTS } from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static INVALID_RATE = (field) =>
        new APIError(
            `Rate (${field}) must be a valid positive float number (without sign eg 1.24)`,
            400,
            "VALIDATION_ERROR"
        );

    static INVALID_PUBLISHER_DATE = new APIError(
        "Publisher followed at (lastPublisherFollowedAt) must be a valid date",
        400,
        "VALIDATION_ERROR"
    );
}

// I cache it because it's a little big to create in each request failure
let errToThrow = {
    invalid_type: {
        ignore: GlobalErrorsEnum.INVALID_IGNORE,
        since: GlobalErrorsEnum.INVALID_DATATYPE("since", "date"),
    },
    invalid_format: {
        lastPublisherFollowedAt: ErrorsEnum.INVALID_PUBLISHER_DATE,
        ignore: GlobalErrorsEnum.INVALID_IGNORE,
    },
    invalid_union: {
        lastPublisherFollowedAt: ErrorsEnum.INVALID_PUBLISHER_DATE,
        lastPublisherRate: ErrorsEnum.INVALID_RATE("lastPublisherRate"),
        firstPublisherRate: ErrorsEnum.INVALID_RATE("firstPublisherRate"),
    },
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getArticleFollowingFreshValidate(req, res, next) {
    try {
        const {
            since = new Date(), // Last artilce date or now
            lastPublisherFollowedAt = new Date(), // Last publisher followed at we used to recomend articles (it will be helpfull when there is two followers have the same interest rate)
            lastPublisherRate = "0", // As we get the most interested publisher for current user we need last publisher rate also
            firstPublisherRate = Number.POSITIVE_INFINITY, // To make a range
            ignore = [], // To ingore already recommended articles
            limit = MIN_RESULTS,
        } = req?.body ?? {};

        const Query = object({
            since: date(),
            lastPublisherFollowedAt: date(),
            lastPublisherRate: union([string().regex(/^\d+(\.{0,1}\d+)?$/)]),
            firstPublisherRate: union([
                string().regex(/^\d+(\.{0,1}\d+)?$/),
                literal(Number.POSITIVE_INFINITY),
            ]),
            ignore: array(string().regex(/^\d+$/)),
            limit: int(),
        });

        req.body = Query.parse({
            since: new Date(since),
            lastPublisherFollowedAt: new Date(lastPublisherFollowedAt),
            firstPublisherRate:
                firstPublisherRate !== Number.POSITIVE_INFINITY
                    ? String(firstPublisherRate)
                    : firstPublisherRate,

            lastPublisherRate: String(lastPublisherRate),

            ignore: ignore?.map((articleId) => String(articleId)),
            limit,
        });

        if (limit < 1 || limit > MAX_RESULTS)
            return next(GlobalErrorsEnum.INVALID_LIMIT);

        return next();
    } catch (err) {
        if (err instanceof ZodError) {
            let code = err?.issues[0].code;
            let path = err?.issues[0].path[0];
            if (errToThrow[code][path]) return next(errToThrow[code][path]);
        }
        next(err);
    }
}

export default getArticleFollowingFreshValidate;
