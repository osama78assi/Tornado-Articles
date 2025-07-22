import {
    MAX_CATEGORIES_ARTICLE_COUNT,
    MAX_TAGS_ARTICLE_COUNT,
    MAX_TOPICS_ARTICLE_COUNT,
} from "../config/settings.js";
import APIError from "./APIError.js";

export default class GlobalErrorsEnum {
    // For all
    static INVALID_DIRECTION = new APIError(
        "Invalid `getAfter`. it must be 0 or 1.",
        400,
        "VALIDATION_ERROR"
    );

    static INVALID_LIMIT = (field, max) =>
        new APIError(
            `Limit (${field}) must be positive integer larger than zero and less than ${max}`,
            400,
            "INVALID_LIMIT"
        );

    static NO_USER_WITH = (getBy, isEmail = true) =>
        new APIError(
            `There is no user with ${isEmail ? "email" : "id"} "${getBy}".`,
            404,
            "USER_NOT_FOUND"
        );

    static INVALID_DATATYPE = (field, type) =>
        new APIError(
            `The field '${field}' must be of type ${type}.`,
            400,
            "VALIDATION_ERROR"
        );

    static MISSING_FIELD = (field) =>
        new APIError(`The field '${field}' is required.`, 400, `MISSING_FIELD`);

    static INVALID_BIGINT_ID = (field) =>
        new APIError(
            `${field} must be a valid integer number (without sign eg 986574)`,
            400,
            "VALIDATION_ERROR"
        );

    static INVALID_FLOAT_NUMBER = (field) =>
        new APIError(
            `(${field}) must be positive string number (plain no signs ex. 12.3)`,
            400,
            "VALIDATION_ERROR"
        );

    static NOT_AUTHORIZED = new APIError(
        "You aren't authorized to do this action",
        401,
        "UNAUTHROIZED"
    );

    static UNSUPPORTED_IMAGES = (exts) =>
        new APIError(
            `Only images accepted. And type of it must be one of these (${exts.join(
                ","
            )})`,
            400,
            "INVALID_IMAGE_TYPE"
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

    static EMAIL_ALREADY_VERIFIED = new APIError(
        "You've already verified your email",
        400,
        "ALREADY_VERIFIED"
    );

    // For articles
    static INVALID_CATEGORIES = new APIError(
        `The "categories" must be array contains ${MAX_CATEGORIES_ARTICLE_COUNT} string integer numbers (IDs) maximum`,
        400,
        "VALIDATION_ERROR"
    );

    static INVALID_TOPICS = new APIError(
        `The "topics" must be array contains ${MAX_TOPICS_ARTICLE_COUNT} string integer numbers (IDs) maximum`,
        400,
        "VALIDATION_ERROR"
    );

    static INVALID_IGNORE = new APIError(
        `The "ignore" must be array contains string numbers (integers) as articles IDs`,
        400,
        "VALIDATION_ERROR"
    );

    static ARTICLE_IMAGES_LIMIT_EXCCEDED = (max) =>
        new APIError(
            `Content pictures limit exceeded. Allowed only ${max} pictures.`,
            400,
            "VALIDATION_ERROR"
        );

    static TOPICS_LIMIT_EXCEEDED = new APIError(
        `The article can have up to ${MAX_TOPICS_ARTICLE_COUNT} topics`,
        400,
        "VALIDATION_ERROR"
    );

    static INVALID_TAGS = new APIError(
        `The article can have up to ${MAX_TAGS_ARTICLE_COUNT} tags`,
        400,
        "VALIDATION_ERROR"
    );

    static INVALID_LANGUAGE = (lang, expected) =>
        new APIError(
            `The language ${lang} isn't supported. the supported are [${expected.join(
                ", "
            )}].`,
            400,
            "VALIDATION_ERROR",
            [
                [
                    "warning",
                    "If you set the language to one of supported but the actual language isn't that type your artilce will face issues in searching",
                ],
            ]
        );

    // For categories
    static INVALID_CATEGORY_LENGTH = new APIError(
        "The category title should be minimum 3 characters and 100 maximum",
        400,
        "VALIDATION_ERROR"
    );

    static INVALID_TITLE = new APIError(
        "Title must be string and its characters must be less than 100 and larger than 3",
        400,
        "VALIDATION_ERROR"
    );

    static INVALID_DESCRIPTION = new APIError(
        "The description must be string and its characters length must be less than 350 or larger than 10",
        400,
        "VALIDATION_ERROR"
    );

    static ARTICLE_NOT_FOUND = (id) =>
        new APIError(
            `The article with id ${id} either deleted or not existed in first place.`,
            404,
            "ARTICLE_NOT_FOUND"
        );
}
