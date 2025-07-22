import {
    array,
    boolean,
    int,
    literal,
    object,
    string,
    union,
    ZodError,
} from "zod/v4";
import {
    SUPPORTED_ARTICLES_LANGUAGES as langs,
    MAX_CATEGORIES_ARTICLE_COUNT,
    MAX_TAGS_ARTICLE_COUNT,
    MAX_TOPICS_ARTICLE_COUNT,
} from "../../../config/settings.js";
import deleteFiles from "../../../util/deleteFiles.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

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
            topics = [], // 5 topics only
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
            categories: array(union([string().regex(/^\d+$/), int()])),
            topics: array(union([string().regex(/^\d+$/), int()])),
            tags: array(string()),
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
                headline: headline === "" ? null : headline,
                topics,
            })
        );

        if (categories.length > MAX_CATEGORIES_ARTICLE_COUNT)
            return next(GlobalErrorsEnum.INVALID_CATEGORIES);

        // Check topics IDs length
        if (topics.length > MAX_TOPICS_ARTICLE_COUNT)
            return next(GlobalErrorsEnum.INVALID_TOPICS);

        if (tags.length > MAX_TAGS_ARTICLE_COUNT)
            return next(GlobalErrorsEnum.INVALID_TAGS);

        next();
    } catch (err) {
        // If some error happened and there are images uploaded. Clear them
        await deleteFiles(req?.files);

        if (err instanceof ZodError) {
            // To reduce nested if statements as much as possible
            const errToThrow = {
                invalid_union: () =>
                    GlobalErrorsEnum.INVALID_LANGUAGE(
                        req?.body?.language,
                        langs
                    ),
                invalid_type: (field, type) =>
                    GlobalErrorsEnum.INVALID_DATATYPE(field, type),
                categories: GlobalErrorsEnum.INVALID_CATEGORIES,
                topics: GlobalErrorsEnum.INVALID_TOPICS,
            };

            let code = err.issues[0].code;
            let path = err.issues[0].path[0];
            let expected = err.issues[0].expected;

            if (
                ["invalid_type", "invalid_format", "invalid_union"].includes(
                    code
                ) &&
                (path === "categories" || path === "topics")
            )
                return next(errToThrow[path]);

            if (code === "invalid_union" && path === "headline")
                return next(
                    GlobalErrorsEnum.INVALID_DATATYPE("headline", "string")
                );

            // The left here are functions
            if (errToThrow[code]) return next(errToThrow[code](path, expected));
        }

        next(err);
    }
}

export default publishArticleValidate;
