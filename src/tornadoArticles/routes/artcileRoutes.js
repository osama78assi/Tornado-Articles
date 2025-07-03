import { Router } from "express";
import adminDeleteArticle from "../controllers/adminDeleteArticle.js";
import deleteArticle from "../controllers/deleteArticle.js";
import editArticleContent from "../controllers/editArticleContent.js";
import editArticleTitle from "../controllers/editArticleTitle.js";
import getArticle from "../controllers/getArticle.js";
import getArticlesFor from "../controllers/getArticlesFor.js";
import getFreshArticles from "../controllers/getFreshArticles.js";
import getOptimalArticles from "../controllers/getOptimalArticle.js";
import getRecommendedArticles from "../controllers/getRecommendedArticles.js";
import publishArticle from "../controllers/publishArticle.js";
import searchForArticleBytTitle from "../controllers/searchForArticleByTitle.js";
import searchForArticleByTags from "../controllers/searchForArtilcesByTags.js";

import isAdmin from "../../../publicMiddlewares/isAdmin.js";
import isAuthenticated from "../../../publicMiddlewares/isAuthenticated.js";
import isLoggedIn from "../../../publicMiddlewares/isLoggedIn.js";
import downloadArticlesPics from "../middlewares/downloadArtilcesPics.js";
import getFreshArticlesValidate from "../middlewares/getFreshArticles.validate.js";
import getOptimalArticlesValidate from "../middlewares/getOptimalArticls.validate.js";
import publishArticleValidate from "../middlewares/publishArticle.validate.js";

const articleRouter = Router();

// Anyone can get articles (home page for guests)
// While it must GET but I made POST because there is a complex filtering
articleRouter.post(
    "/articles/recommend/fresh",
    isLoggedIn,
    getFreshArticlesValidate,
    getFreshArticles
); // WORKING

articleRouter.post(
    "/articles/recommend/optimal",
    isLoggedIn,
    getOptimalArticlesValidate,
    getOptimalArticles
); // WORKING

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
    publishArticleValidate,
    publishArticle
); // DONE

// Search by title
articleRouter.get("/articles/search-by-title", searchForArticleBytTitle); // TODO

// Search by tags
articleRouter.get("/articles/search-by-tags", searchForArticleByTags); // TODO

export default articleRouter;
