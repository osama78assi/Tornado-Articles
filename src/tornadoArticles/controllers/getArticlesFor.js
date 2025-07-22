import canViewArticle from "../../../util/canViewArticle.js";
import ArticleService from "../services/articleService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getArticlesFor(req, res, next) {
    try {
        const { limit, since, lastEntryId, authorId } = req?.validatedQuery;

        const isGuest = req?.isGuest;

        // For now when the user is guest don't include private
        let includePrivate = false;

        // When he isn't a guest there is a authorId

        let { id = null, role = null } = req?.userInfo ?? {};

        // If the user is moderator or admin or the user want to see his/her articles
        if (!isGuest && (canViewArticle(role) || id === authorId))
            includePrivate = true;

        // Now this either will get all articles or only public
        // TODO: When it comes to indexing getting public articles may face performance issues
        // due to using partial index which is great for recommendation more than use left-most of the index
        const articles = await ArticleService.getArticlesFor(
            limit,
            since,
            lastEntryId,
            authorId,
            includePrivate
        );

        // Extract some info for more API friendly. if these are null then no more articles
        let details = {
            lastEntryId:
                articles.length > 0 ? articles.at(-1)?.dataValues?.id : null,
            since:
                articles.length > 0
                    ? articles.at(-1)?.dataValues?.createdAt
                    : null,
        };

        return res.status(200).json({
            success: true,
            data: articles,
            ...details,
        });
    } catch (err) {
        next(err);
    }
}

export default getArticlesFor;
