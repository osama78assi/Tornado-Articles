import removeDuplicated from "../../../util/removeDuplicated.js";
import ArticleService from "../services/articleService.js";
import { deleteFiles, injectImgsInContent } from "../util/index.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function publishArticle(req, res, next) {
    try {
        let {
            title,
            content,
            isPrivate,
            language,
            categories,
            tags,
            headline,
            topics,
        } = req?.body;

        // Remove duplicated values from categories and tags, categories and topics (silently) you can change the behavior and throw an error
        categories = removeDuplicated(categories);
        tags = removeDuplicated(tags);
        topics = removeDuplicated(topics);

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

        content = injectImgsInContent(contentPics, content);

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
            tags,
            headline,
            topics
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
