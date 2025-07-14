import {
    array,
    boolean,
    literal,
    object,
    record,
    string,
    union,
    ZodError,
} from "zod/v4";
import {
    SUPPORTED_ARTICLES_LANGUAGES as langs,
    MAX_ARTICLE_CONTENT_LENGTH,
    MAX_CATEGORIES_ARTICLE_COUNT,
    MAX_TAGS_ARTICLE_COUNT,
    MAX_TOPICS_ARTICLE_COUNT,
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

    static CATEGORY_ID_NOT_PROVIDED = new APIError(
        "There is a categoryId in topics keys that are not included in the provided categories array. Topic must have its category(ies).",
        400,
        "VALIDATION_ERROR"
    );

    static TOPICS_LIMIT_EXCEEDED = new APIError(
        `The article can have up to ${MAX_TOPICS_ARTICLE_COUNT} topics`,
        400,
        "VALIDATION_ERROR"
    );

    static INVALID_TOPICS = new APIError(
        "The topics must be object. Its keys are the categories IDs (string numbers and must be provided in the provided categories IDs). And the keys are of type array contains topics IDs (topic must be related to the category)",
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
            topics = {}, // This will include categoryId: [topicsIds] BUT the categoryId must be in categories. And 7 topics only
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
            topics: record(
                string().regex(/^\d+$/),
                array(string().regex(/^\d+$/))
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
                topics,
            })
        );

        // Save topicsIds
        const topicsIDs = [];

        // Now check the topics
        for (let categoryId in topics) {
            // Check if the key is exists in the categories list you have provided
            if (!categories.includes(categoryId))
                return next(ErrorsEnum.CATEGORY_ID_NOT_PROVIDED);

            // Add that topic
            topicsIDs.push(categoryId);
        }

        // Check topics IDs length
        if (topicsIDs.length > MAX_TOPICS_ARTICLE_COUNT)
            return next(ErrorsEnum.TOPICS_LIMIT_EXCEEDED);

        // Now update the topics in the request body
        req.body.topics = topicsIDs;

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

            if (
                (code === "invalid_type" || code === "invalid_format") &&
                path === "topics"
            )
                return next(ErrorsEnum.INVALID_TOPICS);

            // The left here are functions
            if (errToThrow[code]) return next(errToThrow[code](path, expected));
        }

        next(err);
    }
}

export default publishArticleValidate;
