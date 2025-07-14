import { Router } from "express";

import addTopics from "../controllers/addTopics.js";
import deleteTopics from "../controllers/deleteTopics.js";
import getAllTopics from "../controllers/getAllTopics.js";
import getPreferredTopics from "../controllers/getPreferredTopics.js";
import getTopicDetails from "../controllers/getTopicDetails.js";
import getTopicsByCategory from "../controllers/getTopicsByCategory.js";
import searchToics from "../controllers/searchToics.js";
import updateTopic from "../controllers/updateTopic.js";
import userSearchTopics from "../controllers/userSearchTopics.js";

import isAuthenticated from "../../../publicMiddlewares/isAuthenticated.js";
import isModerator from "../../../publicMiddlewares/isModerator.js";
import addTopicsValidate from "../middlewares/addTopics.validate.js";
import getPaginateDataValidate from "../middlewares/getPaginateData.validate.js";
import getPreferredValidate from "../middlewares/getPreferred.validate.js";
import searchValidate from "../middlewares/search.validate.js";
import updateTopicValidate from "../middlewares/updateTopic.validate.js";

const topicRoutes = Router();

// Moderators can add topics
topicRoutes.post(
    "/topics",
    isAuthenticated,
    isModerator,
    addTopicsValidate,
    addTopics
);

// Moderators can delete topic
topicRoutes.delete(
    "/topics/:topicId",
    isAuthenticated,
    isModerator,
    deleteTopics
);

// Moderators can edit topic
topicRoutes.patch(
    "/topics/:topicId",
    isAuthenticated,
    isModerator,
    updateTopicValidate,
    updateTopic
);

// Anyone can see topics (all)
topicRoutes.get("/topics", getPaginateDataValidate, getAllTopics);

// Anyone can see topics (by category)
topicRoutes.get(
    "/topics/:categoryId/view",
    getPaginateDataValidate,
    getTopicsByCategory
);

// Moderators can see the preferred topics by the people
topicRoutes.get(
    "/topics/preferred",
    isAuthenticated,
    isModerator,
    getPreferredValidate,
    getPreferredTopics
);

// Moderators can search for topics (additional information)
topicRoutes.get(
    "/topics/preferred/search",
    isAuthenticated,
    isModerator,
    searchValidate,
    searchToics
);

// Anyone can search for topics
topicRoutes.get("/topics/search", searchValidate, userSearchTopics); // WORKING

// Anyone can see the details of the category
topicRoutes.get("/topics/:topicId", getTopicDetails);

export default topicRoutes;
