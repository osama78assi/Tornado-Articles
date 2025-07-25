import { unlink } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
    MAX_ARTICLE_CONTENT_PICS_COUNT,
    SUPPORTED_IMAGES_MIMETYPES as supImgs,
} from "../../../config/settings.js";
import getObjectWithKeys from "../../../util/getObjectWithKeys.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import ArticleService from "../services/articleService.js";
import {
    deleteFiles,
    escapeRegexSpecial,
    injectImgsInContent,
} from "../util/index.js";

// This route accpet data wether it's multipart/form-data or application/json . Don't use application/json
// use application/json when you don't have new images for the content
/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function editArticleContent(req, res, next) {
    try {
        let { content } = req?.body;

        // Take user Id to check who is the editor. Only publisher are allowed to do that
        const { id } = req?.userInfo;
        const { articleId } = req?.params;

        // Check if the user have this article. This will throw an error if it's not for the user
        const article = await ArticleService.isArticleForUser(articleId, id);

        // Now when the article is null meaning the article with id isn't existed
        if (article === null)
            return next(GlobalErrorsEnum.ARTICLE_NOT_FOUND(articleId));

        const __dirname = dirname(fileURLToPath(import.meta.url)); // Get current directory name (for paths)

        // 1. Send to the serivce to get images for article
        let images = await ArticleService.getArticleImages(articleId);

        // Make it object where the keys are the images URLs
        images = getObjectWithKeys(images);

        // 2. Extract the images that are used in the content
        const usedImages = {};

        // TODO: this strategy will change a bit in real world when using something like S3 but it will have the same idea
        // Let's extract images URLs to search for them
        // Escape the special chars in the baseURL to be matched without errors in regex
        const baseURL = escapeRegexSpecial(
            `${req.protocol}://${req.get("host")}`
        );

        // Let's prepare the supported images as regexs
        const supImgsRegExp = Object.values(supImgs).join("|");

        // Prepare the final regex. Used RegExp constructor to be able to inject the variables
        const regex = new RegExp(
            `${baseURL}\/uploads\/articles\/\\d+-\\d+\\.${supImgsRegExp}`,
            "g"
        );

        // Mark each found image as found
        for (const match of content.matchAll(regex)) usedImages[match[0]] = 1;

        // 3. Maybe the image is used from another article's images
        // So filter the results depending on current article images
        const deleteImgs = [];
        for (const imgURL in images) {
            // If the image isn't used add it to delete
            if (!usedImages[imgURL]) deleteImgs.push(imgURL);
        }

        // 4. Take the new images if provided
        // Let's extract images URLs
        const protocol = req.protocol;
        const host = req.get("host");

        let contentPics = [];
        if (req?.files?.contentPics?.length > 0) {
            contentPics =
                req?.files?.contentPics?.map(
                    (file) =>
                        `${protocol}://${host}/uploads/articles/${file?.newName}`
                ) || []; // return empty array if the contentPics doesn't exists
        }

        // Inject the images in the content
        content = injectImgsInContent(contentPics, content);

        // Before sending to update. If he has 3 images for example and uploaded 3 images YOU MUST THROW AN ERROR
        if (
            images.length - deleteImgs.length + contentPics.length >
            MAX_ARTICLE_CONTENT_PICS_COUNT
        )
            throw GlobalErrorsEnum.ARTICLE_IMAGES_LIMIT_EXCCEDED(
                MAX_ARTICLE_CONTENT_PICS_COUNT
            );

        // 5. Update the content and article images model.
        await ArticleService.updateArticleContent(
            articleId,
            content,
            contentPics,
            deleteImgs
        );

        // 6. Delete the images from the disk now. After making sure that everything is went without issues
        // Again this logic will change when we use something like S3
        // Feel free to not await it
        await Promise.all(
            deleteImgs.map(async (imgURL) => {
                const path = join(
                    __dirname,
                    "../../../uploads/articles",
                    imgURL.split("/").at(-1)
                );

                return unlink(path); // don't await it
            })
        );

        return res.status(200).json({
            success: true,
            message: "Artilce's content edited successfully",
        });
    } catch (err) {
        // If some error happened and there are images uploaded. Clear them
        // Feel free to not await it
        await deleteFiles(req?.files);
        next(err);
    }
}

export default editArticleContent;
