import { unlink } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import ArticleService from "../services/articleService.js";
import { deleteFiles } from "../util/index.js";

class ErrorsEnum {
    static ONE_REQUIRED = new APIError(
        "Send either the new cover image or 'deleteCover' to remove the article cover",
        400,
        "VALIDATION_ERROR"
    );
}

// This route accept both request wether the type was application/json or multipart/form-data
// but each one got a case. have a cover use multipart. Want to delete use application/json
/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function editArticleCoverPic(req, res, next) {
    try {
        // NOTE: this got higher priority
        const {
            deleteCover = null, // Wether to delete the cover image or not
        } = req?.body ?? {};

        if (deleteCover !== null && typeof deleteCover !== "boolean")
            return next(
                GlobalErrorsEnum.INVALID_DATATYPE("deleteCover", "booleans")
            );

        // When he doesn't send any of them
        if (req?.files?.coverPic?.newName === undefined && deleteCover === null)
            return next(ErrorsEnum.ONE_REQUIRED);

        // Take user Id to check who is the editor. Only publisher are allowed to do that
        const { id } = req?.userInfo;
        const { articleId } = req?.params;

        const __dirname = dirname(fileURLToPath(import.meta.url)); // Get current directory name (for paths)

        // Check if the user have this article. This will throw an error if it's not for the user
        const article = await ArticleService.isArticleForUser(articleId, id, [
            "coverImg",
        ]);

        // Now when the article is null meaning the article with id isn't existed
        if (article === null)
            return next(GlobalErrorsEnum.ARTICLE_NOT_FOUND(articleId));

        if (deleteCover !== true) {
            let coverPic = req?.files?.coverPic?.newName;
            if (coverPic) {
                const protocol = req.protocol;
                const host = req.get("host");

                coverPic = `${protocol}://${host}/uploads/articles/${coverPic}`;

                await ArticleService.updateArticleCover(articleId, coverPic);

                // If the cover update successfully. If there is an old cover delete it
                if (article.dataValues.coverImg !== null) {
                    await unlink(
                        join(
                            __dirname,
                            "../../../uploads/articles",
                            article.dataValues.coverImg.split("/").at(-1)
                        )
                    );
                }

                // Terminate the controller here
                return res.status(200).json({
                    success: true,
                    message: "Cover image added successfully",
                });
            }
        } else if (deleteCover) {
            // This will run only when it's true
            // When user send the request with image. The image is saved on the disk so delete it
            await deleteFiles(req?.files);

            // If there is an image delete it
            if (article.dataValues.coverImg !== null) {
                await ArticleService.updateArticleCover(articleId, null);

                await unlink(
                    join(
                        __dirname,
                        "../../../uploads/articles",
                        article.dataValues.coverImg.split("/").at(-1)
                    )
                );

                return res.status(200).json({
                    success: true,
                    message: "Cover image deleted successfully",
                });
            }

            return res.status(200).json({
                success: true,
                message:
                    "The article doesn't have a cover. or it's already deleted",
            });
        }
    } catch (err) {
        // If you faced any issue
        await deleteFiles(req?.files);
        next(err);
    }
}

export default editArticleCoverPic;
