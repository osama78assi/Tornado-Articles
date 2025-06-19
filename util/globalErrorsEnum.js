import APIError from "./APIError.js";

export default class GlobalErrorsEnum {
    // For all
    static INVALID_DIRECTION = new APIError(
        "Invalid `getAfter`. it must be 0 or 1.",
        400,
        "INVALID_DIRECTION"
    );

    static INVALID_LIMIT = new APIError(
        "Limit must be positive number larger than zero",
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
}
