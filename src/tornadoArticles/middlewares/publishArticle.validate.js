import {
    array,
    boolean,
    literal,
    object,
    string,
    union,
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
        `Content length should be at least 10 characters and maximum ${Math.floor(
            MAX_ARTICLE_CONTENT_LENGTH / 1000
        )}k characters`,
        400,
        "VALIDATION_ERROR"
    );

    static INVALID_HEADLINE = new APIError(
        "The headline must be at least 50 character length or 150 maximum",
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
            headline = null,
        } = req?.body ?? {};

        // Required fields
        if (title === null)
            return next(GlobalErrorsEnum.MISSING_FIELD("title"));

        if (content === null)
            return next(GlobalErrorsEnum.MISSING_FIELD("content"));

        const ArticleSchema = object({
            title: string(),
            content: string(),
            isPrivate: boolean(),
            language: union(langs.map((lang) => literal(lang))),
            categories: array(string().regex(/^\d+$/)).max(
                MAX_CATEGORIES_ARTICLE_COUNT
            ),
            tags: array(string()).max(MAX_TAGS_ARTICLE_COUNT),
            headline: union([string(), literal(null)]),
        });

        Object.assign(
            req.body,
            ArticleSchema.parse({
                title,
                content,
                isPrivate,
                language: language.toLowerCase(),
                categories,
                tags,
                headline,
            })
        );

        next();
    } catch (err) {
        if (err instanceof ZodError) {
            // To reduce nested if statements as much as possible
            const errToThrow = {
                invalid_union: () =>
                    ErrorsEnum.INVALID_LANGUAGE(req?.body?.language, langs),
                invalid_type: (field, type) =>
                    GlobalErrorsEnum.INVALID_DATATYPE(field, type),
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

            if (code === "invalid_union" && path === "headline")
                return next(ErrorsEnum.INVALID_HEADLINE);

            // The left here are functions
            if (errToThrow[code]) return next(errToThrow[code](path, expected));
        }

        next(err);
    }
}

export default publishArticleValidate;
