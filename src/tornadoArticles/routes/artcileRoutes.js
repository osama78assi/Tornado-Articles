import { Router } from "express";
import deleteArticle from "../controllers/deleteArticle.js";
import editArticle from "../controllers/editArticle.js";
import editArticleCatTopics from "../controllers/editArticleCatTopics.js";
import editArticleContent from "../controllers/editArticleContent.js";
import editArticleCoverPic from "../controllers/editArticleCoverPic.js";
import editArticleTags from "../controllers/editArticleTags.js";
import getArticle from "../controllers/getArticle.js";
import getArticlesCategoriesFresh from "../controllers/getArticlesCategoriesFresh.js";
import getArticlesCategoriesOptimal from "../controllers/getArticlesCategoriesOptimal.js";
import getArticlesFollowingsFresh from "../controllers/getArticlesFollowingsFresh.js";
import getArticlesFollowingsOptimal from "../controllers/getArticlesFollowingsOptimal.js";
import getArticlesFor from "../controllers/getArticlesFor.js";
import getArtilcesTopicFresh from "../controllers/getArtilcesTopicFresh.js";
import getArtilcesTopicOptimal from "../controllers/getArtilcesTopicOptimal.js";
import getFreshArticles from "../controllers/getFreshArticles.js";
import getOptimalArticles from "../controllers/getOptimalArticle.js";
import moderatorDeleteArticle from "../controllers/moderatorDeleteArticle.js";
import publishArticle from "../controllers/publishArticle.js";
import searchForArticleBytTitle from "../controllers/searchForArticleByTitle.js";
import searchForArticleByTags from "../controllers/searchForArtilcesByTags.js";

import isAuthenticated from "../../../publicMiddlewares/isAuthenticated.js";
import isEmailVerified from "../../../publicMiddlewares/isEmailVerified.js";
import isLoggedIn from "../../../publicMiddlewares/isLoggedIn.js";
import isModerator from "../../../publicMiddlewares/isModerator.js";
import downloadArticleContentPics from "../middlewares/downloadArticleContentPics.js";
import downloadArticlePics from "../middlewares/downloadArtilcePics.js";
import downloadArticleCoverImg from "../middlewares/downloadCoverImg.js";
import editArticleValidate from "../middlewares/editArticle.validate.js";
import editArticleCatTopicsValidate from "../middlewares/editArticleCatTopics.validate.js";
import editArticleContentValidate from "../middlewares/editArticleContent.validate.js";
import editArticleTagsValidate from "../middlewares/editArticleTags.validate.js";
import followingsDataValidate from "../middlewares/followingsData.validate.js";
import freshArticlesValidate from "../middlewares/freshArticles.validate.js";
import getArticlesForValidate from "../middlewares/getArticlesFor.validate.js";
import moderatorDeleteArticleValidate from "../middlewares/moderatorDeleteArticle.validate.js";
import optimalArticlesValidate from "../middlewares/optimalArticls.validate.js";
import preferenceDataValidate from "../middlewares/preferenceData.vaildate.js";
import publishArticleValidate from "../middlewares/publishArticle.validate.js";

const articleRouter = Router();

// User can publish articles
articleRouter.post(
    "/articles",
    isAuthenticated,
    isEmailVerified, // Only verified emails can publish articles
    downloadArticlePics,
    publishArticleValidate,
    publishArticle
); // DONE

// Anyone can get the articles for any user
articleRouter.get(
    "/articles",
    isLoggedIn,
    getArticlesForValidate,
    getArticlesFor
); // DONE

// Anyone can get articles (home page for guests)
// While it must GET but I made POST because there is a complex filtering
articleRouter.post(
    "/articles/fresh",
    isLoggedIn,
    freshArticlesValidate,
    getFreshArticles
); // DONE

articleRouter.post(
    "/articles/optimal",
    isLoggedIn,
    optimalArticlesValidate,
    getOptimalArticles
); // DONE

// Search by title
articleRouter.get("/articles/search-by-title", searchForArticleBytTitle); // TODO

// Search by tags
articleRouter.get("/articles/search-by-tags", searchForArticleByTags); // TODO

// Get the article details
articleRouter.get("/articles/:articleId", isLoggedIn, getArticle); // DONE

// User can delete his article
articleRouter.delete("/articles/:articleId", isAuthenticated, deleteArticle); // DONE

// User can edit the (title/minsToRead... all not included fields below) of the article
articleRouter.patch(
    "/articles/:articleId",
    isAuthenticated,
    downloadArticlePics,
    editArticleValidate,
    editArticle
); // DONE

// Admin/Moderator can delete any article
// Post because there is a body
articleRouter.post(
    "/articles/:articleId/delete",
    isAuthenticated,
    isModerator,
    moderatorDeleteArticleValidate,
    moderatorDeleteArticle
); // DONE

// User can update article's content
articleRouter.patch(
    "/articles/:articleId/content",
    isAuthenticated,
    downloadArticleContentPics,
    editArticleContentValidate,
    editArticleContent
); // DONE

// User can change categories and topics for his article
articleRouter.patch(
    "/articles/:articleId/preferences",
    isAuthenticated,
    editArticleCatTopicsValidate,
    // measureHandlerTime(
    //     editArticleCatTopics,
    //     "Update Article categories and topics"
    // )
    editArticleCatTopics
); // DONE

// User can change his article's cover image
articleRouter.patch(
    "/articles/:articleId/cover",
    isAuthenticated,
    downloadArticleCoverImg,
    editArticleCoverPic
); // DONE

// User can change tags for his article
articleRouter.patch(
    "/articles/:articleId/tags",
    isAuthenticated,
    editArticleTagsValidate,
    editArticleTags
); // DONE

// User get recommended articles. Following stage (fresh)
articleRouter.post(
    "/articles/recommends/followings/fresh",
    isAuthenticated,
    followingsDataValidate,
    freshArticlesValidate, // Here is the same but we don't care about passed categories array
    getArticlesFollowingsFresh
); // DONE

// User get recommended articles. Following stage (optimal)
articleRouter.post(
    "/articles/recommends/followings/optimal",
    isAuthenticated,
    followingsDataValidate,
    optimalArticlesValidate, // This is the same but here we don't care about passed categories array
    getArticlesFollowingsOptimal
); // DONE

// User get recommended articles. categories preferred stage (fresh)
articleRouter.post(
    "/articles/recommends/categories/fresh",
    isAuthenticated,
    preferenceDataValidate,
    freshArticlesValidate, // This is the same as getFreshArticle only instead here we don't care about the categories array
    getArticlesCategoriesFresh
); // DONE

// User get recommended articles. categories preferred stage (optimal)
articleRouter.post(
    "/articles/recommends/categories/optimal",
    isAuthenticated,
    preferenceDataValidate,
    optimalArticlesValidate,
    getArticlesCategoriesOptimal
); // DONE

// User get recommended articles. recomend stage by topic(fresh)
articleRouter.post(
    "/articles/recommends/topics/fresh",
    isAuthenticated,
    preferenceDataValidate,
    freshArticlesValidate,
    getArtilcesTopicFresh
); // DONE

// User get recommended articles. recomend stage by topic(optimal)
articleRouter.post(
    "/articles/recommends/topics/optimal",
    isAuthenticated,
    preferenceDataValidate,
    optimalArticlesValidate,
    getArtilcesTopicOptimal
); // DONE

export default articleRouter;
