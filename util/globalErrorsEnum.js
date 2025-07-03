import {
    MAX_CATEGORIES_ARTICLE_COUNT,
    MAX_RESULTS,
} from "../config/settings.js";
import APIError from "./APIError.js";

export default class GlobalErrorsEnum {
    // For all
    static INVALID_DIRECTION = new APIError(
        "Invalid `getAfter`. it must be 0 or 1.",
        400,
        "VALIDATION_ERROR"
    );

    static INVALID_LIMIT = new APIError(
        `Limit must be positive integer larger than zero and less than ${MAX_RESULTS}`,
        400,
        "INVALID_LIMIT"
    );

    static NO_USER_WITH = (getBy, isEmail = true) =>
        new APIError(
            `There is no user with ${isEmail ? "email" : "id"} "${getBy}".`,
            404,
            "USER_NOT_FOUND"
        );

    static INVALID_ID = new APIError(
        "The provided ID isn't valid as UUIDv4",
        400,
        "INVALID_ID"
    );

    static INVALID_DATATYPE = (field, type) =>
        new APIError(
            `The field '${field}' must be of type ${type}.`,
            400,
            "VALIDATION_ERROR"
        );

    static MISSING_FIELD = (field) =>
        new APIError(`The field '${field}' is required.`, 400, `MISSING_FIELD`);

    // For Auth
    static MISSING_REFRESH_TOKEN = new APIError(
        "No refresh token provided. Please login again",
        401,
        "NO_REFRESH_TOKEN"
    );

    static INVALID_REFRESH_TOKEN = new APIError(
        "Invalid refresh token. Please login again",
        401,
        "INVALID_REFRESH_TOKEN"
    );

    static REFRESH_TOKEN_EXPIRED = new APIError(
        "The refresh token is expired. Please login again",
        401,
        "REFRESH_TOKEN_EXPIRED"
    );

    static INVALID_EMAIL_FORMAT = new APIError(
        "The provided email's format isn't valid",
        400,
        "VALIDATION_ERROR"
    );

    static TOO_LONG_EMAIL = new APIError(
        "The provided email length should be maximum 254 char length",
        400,
        "VALIDATION_ERROR"
    );

    // For articles
    static INVALID_CATEGORIES = new APIError(
        `The "catgeories" must be array contains ${MAX_CATEGORIES_ARTICLE_COUNT} string categories IDs (UUID v4) maximum`,
        400,
        "VALIDATION_ERROR"
    );

    static INVALID_IGNORE = new APIError(
        `The "ignore" must be array contains string numbers (integers) as articles IDs`,
        400,
        "VALIDATION_ERROR"
    );

    // For categories
    static INVALID_CATEGORY_LENGTH = new APIError(
        "The category title should be minimum 3 characters and 100 maximum",
        400,
        "VALIDATION_ERROR"
    );
}
