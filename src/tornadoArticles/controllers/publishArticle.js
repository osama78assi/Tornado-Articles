import APIError from "../../../util/APIError.js";
import deleteFiles from "../../../util/deleteFiles.js";
import ArticleService from "../services/articleService.js";

import {
    MAX_CATEGORIES_ARTICLE_COUNT,
    MAX_TAGS_ARTICLE_COUNT,
} from "../../../config/settings.js";
import measureFuncTime from "../../../util/measureFuncTime.js";

class ErrorEnums {
    static MISSING_TITLE = new APIError(
        "Title is a required field.",
        400,
        "MISSING_TITLE"
    );
    static MISSINGS_CONTENT = new APIError(
        "Content is a required field.",
        400,
        "MISSING_CONTENT"
    );

    static INVALID_CATEGORIES = new APIError(
        "Categories must be array",
        400,
        "WRONG_CATEGORY_DATATYPE"
    );

    static TOO_MANY_CATEGORIES = new APIError(
        `The article can have maximum ${MAX_CATEGORIES_ARTICLE_COUNT} categories.`,
        400,
        "CATEGORIES_LIMIT"
    );

    static TOO_MANY_TAGS = new APIError(
        `The article can have maximum ${MAX_TAGS_ARTICLE_COUNT} tags.`,
        400,
        "TAGS_LIMIT"
    );

    static INVALID_TAGS = new APIError(
        "Tags must be array",
        400,
        "WRONG_TAGS_DATATYPE"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function publishArticle(req, res, next) {
    try {
        let {
            title = null,
            content = null,
            isPrivate = false,
            language = "english",
            categories = [],
            tags = [],
        } = req?.body ?? {};

        // Normal validation
        if (title === null) return next(ErrorEnums.MISSING_TITLE);
        if (content === null) return next(ErrorEnums.MISSINGS_CONTENT);

        // These fields must be arrays. even if one item
        if (!Array.isArray(categories))
            return next(ErrorEnums.INVALID_CATEGORIES);
        if (!Array.isArray(tags)) return next(ErrorEnums.INVALID_TAGS);

        // These arrays got a limit btw
        if (categories.length > MAX_CATEGORIES_ARTICLE_COUNT)
            return next(ErrorEnums.TOO_MANY_CATEGORIES);
        if (tags.length > MAX_TAGS_ARTICLE_COUNT)
            return next(ErrorEnums.TOO_MANY_TAGS);

        // Get user Id
        const userId = req.userInfo.id;

        // Let's extract images URLs
        const protocol = req.protocol;
        const host = req.get("host");
        let coverPic = req?.files?.coverPic?.[0]?.filename;
        if (coverPic) {
            coverPic = `${protocol}://${host}/uploads/articles/${coverPic}`;
        }

        // Same for content images
        let contentPics = [];
        if (req?.files) {
            contentPics =
                req?.files?.contentPics?.map(
                    (file) =>
                        `${protocol}://${host}/uploads/articles/${file?.filename}`
                ) || []; // return empty array if the contentPics doesn't exists
        }

        // Replace the placeholders for images with images URLs.
        // Allowing the user to add images in any place of the article
        if (contentPics.length !== 0) {
            content = content.replaceAll(/\{\d\}/g, function (placeholder) {
                // That number is the number of the image not the index
                const index = +placeholder[1] - 1;
                if (index >= contentPics.length || index < 0)
                    return placeholder;
                else return `![content-image-${index}](${contentPics[index]})`;
            });
        }

        // Safe the document (due to the complex relationships I will made one query getting publisher, likes count and comments count)
        const artilceId = await ArticleService.publishArticle(
            userId,
            title,
            content,
            isPrivate,
            language,
            coverPic,
            contentPics,
            categories,
            tags
        );

        // For testing
        // const artilceId = await measureFuncTime(
        //     "Function for publish a new article",
        //     ArticleService.publishArticle,
        //     [
        //         userId,
        //         title,
        //         content,
        //         isPrivate,
        //         language,
        //         coverPic,
        //         contentPics,
        //         categories,
        //         tags,
        //     ]
        // );

        // Because of getting the article is complex I separated them
        const articleData = await ArticleService.getArticleDetails(artilceId);

        return res.status(200).json({
            success: true,
            data: articleData,
        });
    } catch (err) {
        // Delete images if exist
        await deleteFiles(req?.files);
        next(err);
    }
}

export default publishArticle;
