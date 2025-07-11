import { Router } from "express";
import adminDeleteArticle from "../controllers/adminDeleteArticle.js";
import deleteArticle from "../controllers/deleteArticle.js";
import editArticleContent from "../controllers/editArticleContent.js";
import editArticleTitle from "../controllers/editArticleTitle.js";
import getArticle from "../controllers/getArticle.js";
import getArticlesFollowingsFresh from "../controllers/getArticlesFollowingsFresh.js";
import getArticlesFor from "../controllers/getArticlesFor.js";
import getFreshArticles from "../controllers/getFreshArticles.js";
import getOptimalArticles from "../controllers/getOptimalArticle.js";
import publishArticle from "../controllers/publishArticle.js";
import searchForArticleBytTitle from "../controllers/searchForArticleByTitle.js";
import searchForArticleByTags from "../controllers/searchForArtilcesByTags.js";

import isAdmin from "../../../publicMiddlewares/isAdmin.js";
import isAuthenticated from "../../../publicMiddlewares/isAuthenticated.js";
import isLoggedIn from "../../../publicMiddlewares/isLoggedIn.js";
import getArticlesCategoriesFresh from "../controllers/getArticlesCategoriesFresh.js";
import getArticlesCategoriesOptimal from "../controllers/getArticlesCategoriesOptimal.js";
import getArticlesFollowingsOptimal from "../controllers/getArticlesFollowingsOptimal.js";
import getArtilcesRecomendsFresh from "../controllers/getArtilcesRecomendsFresh.js";
import getArtilcesRecomendsOptimal from "../controllers/getArtilcesRecomendsOptimal.js";
import categoryDataVaildate from "../middlewares/categoryData.vaildate.js";
import downloadArticlesPics from "../middlewares/downloadArtilcesPics.js";
import followingsDataValidate from "../middlewares/followingsData.validate.js";
import getFreshArticlesValidate from "../middlewares/getFreshArticles.validate.js";
import getOptimalArticlesValidate from "../middlewares/getOptimalArticls.validate.js";
import publishArticleValidate from "../middlewares/publishArticle.validate.js";
import isEmailVerified from "../../../publicMiddlewares/isEmailVerified.js";

const articleRouter = Router();

// Anyone can get articles (home page for guests)
// While it must GET but I made POST because there is a complex filtering
articleRouter.post(
    "/articles/fresh",
    isLoggedIn,
    getFreshArticlesValidate,
    getFreshArticles
); // DONE

articleRouter.post(
    "/articles/optimal",
    isLoggedIn,
    getOptimalArticlesValidate,
    getOptimalArticles
); // DONE

// Anyone can get the articles for any user
articleRouter.get("/articles/:userId", getArticlesFor); // TODO

// User get recommended articles. Following stage (fresh)
articleRouter.post(
    "/articles/recommends/followings/fresh",
    isAuthenticated,
    followingsDataValidate,
    getFreshArticlesValidate, // Here is the same but we don't care about passed categories array
    getArticlesFollowingsFresh
); // DONE

// User get recommended articles. Following stage (optimal)
articleRouter.post(
    "/articles/recommends/followings/optimal",
    isAuthenticated,
    followingsDataValidate,
    getOptimalArticlesValidate, // This is the same but here we don't care about passed categories array
    getArticlesFollowingsOptimal
); // DONE

// User get recommended articles. categories preferred stage (fresh)
articleRouter.post(
    "/articles/recommends/categories/fresh",
    isAuthenticated,
    categoryDataVaildate,
    getFreshArticlesValidate, // This is the same as getFreshArticle only instead here we don't care about the categories array
    getArticlesCategoriesFresh
); // DONE

// User get recommended articles. categories preferred stage (optimal)
articleRouter.post(
    "/articles/recommends/categories/optimal",
    isAuthenticated,
    categoryDataVaildate,
    getOptimalArticlesValidate,
    getArticlesCategoriesOptimal
); // WORKING

// User get recommended articles. recomend stage by cookies for example (fresh)
articleRouter.post(
    "/articles/recommends/recomends/fresh",
    isAuthenticated,
    getArtilcesRecomendsFresh
); // TODO

// User get recommended articles. recomend stage by cookies for example (optimal)
articleRouter.post(
    "/articles/recommends/recomends/optimal",
    isAuthenticated,
    getArtilcesRecomendsOptimal
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
    isEmailVerified, // Only verified emails can publish articles
    downloadArticlesPics,
    publishArticleValidate,
    publishArticle
); // DONE

// Search by title
articleRouter.get("/articles/search-by-title", searchForArticleBytTitle); // TODO

// Search by tags
articleRouter.get("/articles/search-by-tags", searchForArticleByTags); // TODO

export default articleRouter;
