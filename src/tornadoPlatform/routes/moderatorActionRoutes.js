import { Router } from "express";

import deleteAction from "../controllers/deleteAction.js";
import getActions from "../controllers/getActions.js";
import getActionsByUser from "../controllers/getActionsByUser.js";
import publishAction from "../controllers/publishAction.js";
import updateAction from "../controllers/updateAction.js";
import getActionsValidate from "../middlewares/getActions.validate.js";

import isAuthenticated from "../../../publicMiddlewares/isAuthenticated.js";
import isModerator from "../../../publicMiddlewares/isModerator.js";
import deleteNullRecords from "../controllers/deleteNullRecords.js";
import publishActionValidate from "../middlewares/publishAction.validate.js";
import updateActionValidate from "../middlewares/updateAction.validate.js";
import deleteNullRecordsValidate from "../middlewares/deleteNullRecords.validate.js";

const moderatorActionRoutes = Router();

// Moderators can get all actions
moderatorActionRoutes.get(
    "/moderator-actions",
    isAuthenticated,
    isModerator,
    getActionsValidate,
    getActions
);

// Moderators can publish an action like user warning or add categories. That up to them
moderatorActionRoutes.post(
    "/moderator-actions",
    isAuthenticated,
    isModerator,
    publishActionValidate,
    publishAction
);

// Moderators can delete rows where userId is null
moderatorActionRoutes.delete(
    "/moderator-actions",
    isAuthenticated,
    isModerator,
    deleteNullRecordsValidate,
    deleteNullRecords
);

// Moderators can delete some actions
moderatorActionRoutes.delete(
    "/moderator-actions/:actionId",
    isAuthenticated,
    isModerator,
    deleteAction
);

// Moderators can see `History` or actions take for user with x ID
moderatorActionRoutes.get(
    "/moderator-actions/:userId",
    isAuthenticated,
    isModerator,
    getActionsValidate,
    getActionsByUser
);

// Moderators can update some fields of actions
moderatorActionRoutes.patch(
    "/moderator-actions/:actionId",
    isAuthenticated,
    isModerator,
    updateActionValidate,
    updateAction
);

export default moderatorActionRoutes;
