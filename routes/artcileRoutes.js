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

const isAuthenticated = require("../middlewares/isAuthenticated");
const isAdmin = require("../middlewares/isAdmin");
const publishArticle = require("../controllers/article/publishArticle");

const articleRouter = Router();

// Anyone can get articles (home page for guests)
articleRouter.get("/articles", getArticles);

// User get recomment articles
articleRouter.get(
    "/articles/recommended",
    isAuthenticated,
    getRecommendedArticles
);

// Get the article details
articleRouter.get("/articles/:articleId", getArticle);

// User can edit the title of the article
articleRouter.patch(
    "/articles/:articleId/title",
    isAuthenticated,
    editArticleTitle
);

// User can edit the content
articleRouter.patch(
    "/articles/:articleId/content",
    isAuthenticated,
    editArticleContent
);

// User can delete his article
articleRouter.delete("/articles/:articleId", isAuthenticated, deleteArticle);

// Admin delete any article
articleRouter.delete(
    "/admin/articles/:articleId",
    isAuthenticated,
    isAdmin,
    adminDeleteArticle
);

// User can create articles
articleRouter.post("/articles", isAuthenticated, publishArticle);

// Search by title
articleRouter.get("/articles/search-by-title", searchForArticleBytTitle);

// Search by tags
articleRouter.get("/articles/search-by-tags", searchForArticleByTags);

module.exports = articleRouter;
