import {
    array,
    boolean,
    literal,
    object,
    string,
    union,
    uuidv4,
    ZodError,
} from "zod/v4";
import {
    SUPPORTED_ARTICLES_LANGUAGES as langs,
    MAX_ARTICLE_CONTENT_LENGTH,
    MAX_CATEGORIES_ARTICLE_COUNT,
    MAX_TAGS_ARTICLE_COUNT,
} from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static INVALID_LANGUAGE = (lang, expected) =>
        new APIError(
            `The language ${lang} isn't supported. the supported is [${expected.join(
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

    static INVALID_TITLE_LENGTH = new APIError(
        "The article title should be minimum 3 characters and maximum 300.",
        400,
        "VALIDATION_ERROR"
    );

    static INVALID_CONTENT_LENGTH = new APIError(
        `Content length should be at least 10 characters and maximum ${MAX_ARTICLE_CONTENT_LENGTH} characters`,
        400,
        "VALIDATION_ERROR"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function publishArticleValidate(req, res, next) {
    try {
        let {
            title = null,
            content = null,
            isPrivate = false,
            language = "english",
            categories = [],
            tags = [],
        } = req?.body ?? {};

        // Required fields
        if (title === null)
            return next(GlobalErrorsEnum.MISSING_FIELD("title"));

        if (content === null)
            return next(GlobalErrorsEnum.MISSING_FIELD("content"));

        const ArticleSchema = object({
            title: string().trim().min(3).max(300),
            content: string().trim().min(10).max(MAX_ARTICLE_CONTENT_LENGTH),
            isPrivate: boolean(),
            language: union(langs.map((lang) => literal(lang))),
            categories: array(uuidv4()).max(MAX_CATEGORIES_ARTICLE_COUNT),
            tags: array(string()).max(MAX_TAGS_ARTICLE_COUNT),
        });

        req.body = ArticleSchema.parse({
            title,
            content,
            isPrivate,
            language: language.toLowerCase(),
            categories,
            tags,
        });

        next();
    } catch (err) {
        if (err instanceof ZodError) {
            // To reduce nested if statements as much as possible
            const errToThrow = {
                invalid_union: () =>
                    ErrorsEnum.INVALID_LANGUAGE(req?.body?.language, langs),
                invalid_type: (field, type) =>
                    GlobalErrorsEnum.INVALID_DATATYPE(field, type),
                too_small: (field) => {
                    return {
                        title: ErrorsEnum.INVALID_TITLE_LENGTH,
                        content: ErrorsEnum.INVALID_CONTENT_LENGTH,
                    }[field]; // Chose one
                },
                too_big: (field) => {
                    return {
                        title: ErrorsEnum.INVALID_TITLE_LENGTH,
                        content: ErrorsEnum.INVALID_CONTENT_LENGTH,
                    }[field]; // Chose one
                },

                categories: GlobalErrorsEnum.INVALID_CATEGORIES,
            };

            let code = err.issues[0].code;
            let path = err.issues[0].path[0];
            let expected = err.issues[0].expected;

            if (
                (code === "invalid_type" || code === "invalid_format") &&
                path === "categories"
            )
                return next(errToThrow.categories);

            // The left here are functions
            if (errToThrow[code]) return next(errToThrow[code](path, expected));
        }

        next(err);
    }
}

export default publishArticleValidate;
