import { Router } from "express";
import adminDeleteArticle from "../controllers/article/adminDeleteArticle";
import deleteArticle from "../controllers/article/deleteArticle";
import editArticleContent from "../controllers/article/editArticleContent";
import editArticleTitle from "../controllers/article/editArticleTitle";
import getArticle from "../controllers/article/getArticle";
import getArticles from "../controllers/article/getArticles";
import getArticlesFor from "../controllers/article/getArticlesFor";
import getRecommendedArticles from "../controllers/article/getRecommendedArticles";
import publishArticle from "../controllers/article/publishArticle";
import searchForArticleBytTitle from "../controllers/article/searchForArticleByTitle";
import searchForArticleByTags from "../controllers/article/searchForArtilcesByTags";

import isAdmin from "../../../publicMiddlewares//isAdmin";
import isAuthenticated from "../../../publicMiddlewares/isAuthenticated";
import downloadArticlesPics from "../middlewares/downloadArticlesPics";

const articleRouter = Router();

// Anyone can get the articles for any user
articleRouter.get("/articles/:userId", getArticlesFor); // TODO

// User get recomment articles
articleRouter.get(
    "/articles/recommended",
    isAuthenticated,
    getRecommendedArticles
); // TODO

// Get the article details
articleRouter.get("/articles/view/:articleId", getArticle); // DONE

// User can edit the title of the article
articleRouter.patch(
    "/articles/:articleId/title",
    isAuthenticated,
    editArticleTitle
); // TODO

// User can edit the content
articleRouter.patch(
    "/articles/:articleId/content",
    isAuthenticated,
    editArticleContent
); // TODO

// User can delete his article
articleRouter.delete("/articles/:articleId", isAuthenticated, deleteArticle); // TODO

// Admin delete any article
articleRouter.delete(
    "/admin/articles/:articleId",
    isAuthenticated,
    isAdmin,
    adminDeleteArticle
); // TODO

// User can publish articles
articleRouter.post(
    "/articles",
    isAuthenticated,
    downloadArticlesPics,
    publishArticle
); // DONE

// Anyone can get articles (home page for guests)
articleRouter.get("/articles", getArticles); // WORKING

// Search by title
articleRouter.get("/articles/search-by-title", searchForArticleBytTitle); // TODO

// Search by tags
articleRouter.get("/articles/search-by-tags", searchForArticleByTags); // TODO

export default articleRouter;
