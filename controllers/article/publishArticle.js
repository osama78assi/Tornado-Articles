const { Request, Response } = require("express");
const OperationError = require("../../helper/operationError");
const fs = require("fs/promises");
const path = require("path");
const isFileExists = require("../../helper/isFileExists");
const Article = require("../../models/article");
const deleteFiles = require("../../helper/deleteFiles");

class ErrorEnums {
    static MISSING_TITLE = new OperationError(
        "Title is a required field.",
        400
    );
    static MISSINGS_CONTENT = new OperationError(
        "Content is a required field.",
        400
    );

    static INVALID_CATEGORIES = new OperationError(
        "Categories must be array",
        400
    );

    static INVALID_TAGS = new OperationError("Tags must be array", 400);
}

/**
 *
 * @param {Request} req
 * @param {Response} res
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
        } = req?.body || {};

        if (title === null) return next(ErrorEnums.MISSING_TITLE);
        if (content === null) return next(ErrorEnums.MISSINGS_CONTENT);
        if (!Array.isArray(categories))
            return next(ErrorEnums.INVALID_CATEGORIES);
        if (!Array.isArray(tags)) return next(ErrorEnums.INVALID_TAGS);

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
        const artilceId = await Article.publishArticle(
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

        // Because of getting the article is complex I separated them
        const articleData = await Article.getArticleDetails(artilceId);

        return res.status(200).json({
            status: "success",
            data: articleData,
        });
    } catch (err) {
        // Delete cover image if exists
        await deleteFiles(req?.files);
        next(err);
    }
}

module.exports = publishArticle;
