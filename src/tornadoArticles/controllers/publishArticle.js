import APIError from "../../../util/APIError.js";
import deleteFiles from "../../../util/deleteFiles.js";
import ArticleService from "../services/articleService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function publishArticle(req, res, next) {
    try {
        let { title, content, isPrivate, language, categories, tags } =
            req?.body;

        // Get user Id
        const userId = req.userInfo.id;

        // Let's extract images URLs
        const protocol = req.protocol;
        const host = req.get("host");

        // Extract the images
        let coverPic = req?.files?.coverPic?.newName;
        if (coverPic) {
            coverPic = `${protocol}://${host}/uploads/articles/${coverPic}`;
        }

        // Same for content images
        let contentPics = [];
        if (req?.files?.contentPics?.length > 0) {
            contentPics =
                req?.files?.contentPics?.map(
                    (file) =>
                        `${protocol}://${host}/uploads/articles/${file?.newName}`
                ) || []; // return empty array if the contentPics doesn't exists
        }

        // If the user uploaded images and didn't used them (or at least one of them)
        let menthionedImgs = 0;

        // Replace the placeholders for images with images URLs.
        // Allowing the user to add images in any place of the article
        if (contentPics.length !== 0) {
            content = content.replaceAll(/\{\{\d\}\}/g, function (placeholder) {
                // That number is the number of the image not the index
                const index = +placeholder[1] - 1;
                if (index >= contentPics.length || index < 0)
                    return placeholder;
                else {
                    menthionedImgs++;
                    return `![content-image-${index}](${contentPics[index]})`;
                }
            });
        }

        // Throw an error in case he didn't used them
        if (menthionedImgs !== contentPics.length) {
            await deleteFiles(req.files)
            return next(
                new APIError(
                    "You've not used all the uploaded images",
                    400,
                    "VALIDATION_ERROR"
                )
            );
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
