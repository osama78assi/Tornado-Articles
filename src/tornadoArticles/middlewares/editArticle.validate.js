import { boolean, int, literal, object, string, union, ZodError } from "zod/v4";
import { SUPPORTED_ARTICLES_LANGUAGES as langs } from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static ONE_FIELD_REQUIRED = new APIError(
        "Provide one field at least (title, language, isPrivate, minsToRead, headline)",
        400,
        "MISSING_DATA"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function editArticleValidate(req, res, next) {
    try {
        const {
            isPrivate = undefined, // Wether to make the article private or not
            minsToRead = undefined, // Minutes to read
            language = undefined, // Language want to change
            title = undefined, // The new title
            headline = undefined,
        } = req?.body ?? {};

        if (
            isPrivate === undefined &&
            minsToRead === undefined &&
            language === undefined &&
            title === undefined &&
            headline === undefined
        )
            return next(ErrorsEnum.ONE_FIELD_REQUIRED);

        const Query = object({
            isPrivate: boolean().optional(),
            minsToRead: int().optional(),
            language: union(langs.map((lang) => literal(lang))).optional(),
            title: string().optional(),
            headline: union([string(), literal(undefined)]).optional(),
        });

        Object.assign(
            req.body,
            Query.parse({
                isPrivate,
                minsToRead,
                language: language?.toLowerCase?.(),
                title,
            })
        );

        return next();
    } catch (err) {
        if (err instanceof ZodError) {
            let code = err.issues[0].code;
            let path = err.issues[0].path[0];
            let expected = err.issues[0].expected;

            if (
                (code === "invalid_value" || code === "invalid_union") &&
                path === "language"
            )
                return next(
                    GlobalErrorsEnum.INVALID_LANGUAGE(req?.body?.language, langs)
                );

            if (
                (code === "invalid_union" || code === "invalid_value") &&
                path === "headline"
            )
                return next(
                    GlobalErrorsEnum.INVALID_DATATYPE("headline", "string")
                );

            if (code === "invalid_type")
                return next(GlobalErrorsEnum.INVALID_DATATYPE(path, expected));
        }
        next(err);
    }
}

export default editArticleValidate;
