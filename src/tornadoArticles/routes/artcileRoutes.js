import { Router } from "express";
import adminDeleteArticle from "../controllers/adminDeleteArticle.js";
import deleteArticle from "../controllers/deleteArticle.js";
import editArticleContent from "../controllers/editArticleContent.js";
import editArticleTitle from "../controllers/editArticleTitle.js";
import getArticle from "../controllers/getArticle.js";
import getArticles from "../controllers/getArticles.js";
import getArticlesFor from "../controllers/getArticlesFor.js";
import getRecommendedArticles from "../controllers/getRecommendedArticles.js";
import publishArticle from "../controllers/publishArticle.js";
import searchForArticleBytTitle from "../controllers/searchForArticleByTitle.js";
import searchForArticleByTags from "../controllers/searchForArtilcesByTags.js";

import isAdmin from "../../../publicMiddlewares/isAdmin.js";
import isAuthenticated from "../../../publicMiddlewares/isAuthenticated.js";
import downloadArticlesPics from "../middlewares/downloadArticlesPics.js";

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
