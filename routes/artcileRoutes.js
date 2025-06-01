const { Router } = require("express");
const getArticles = require("../controllers/article/getArticles");
const getArticle = require("../controllers/article/getArticle");
const getRecommendedArticles = require("../controllers/article/getRecommendedArticles");
const deleteArticle = require("../controllers/article/deleteArticle");
const editArticleTitle = require("../controllers/article/editArticleTitle");
const editArticleContent = require("../controllers/article/editArticleContent");
const adminDeleteArticle = require("../controllers/article/adminDeleteArticle");
const searchForArticleBytTitle = require("../controllers/article/searchForArticleByTitle");
const searchForArticleByTags = require("../controllers/article/searchForArtilcesByTags");
const getArticlesFor = require("../controllers/article/getArticlesFor");

const isAuthenticated = require("../middlewares/isAuthenticated");
const isAdmin = require("../middlewares/isAdmin");
const publishArticle = require("../controllers/article/publishArticle");
const downloadArticlesPics = require("../middlewares/downloadArticlesPics");

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

module.exports = articleRouter;
