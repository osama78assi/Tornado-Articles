import { Router } from "express";
import addCategories from "../controllers/addCategories.js";
import deleteCategory from "../controllers/deleteCategory.js";
import getCategories from "../controllers/getCategories.js";
import getCategoriesDetails from "../controllers/getCategoryDetails.js";
import getPreferred from "../controllers/getPreferredCategories.js";
import searchCategories from "../controllers/searchCategories.js";
import updateCategory from "../controllers/updateCategory.js";
import userSearchCategory from "../controllers/userSearchCategory.js";

import isAuthenticated from "../../../publicMiddlewares/isAuthenticated.js";
import isModerator from "../../../publicMiddlewares/isModerator.js";
import addCategoriesValidate from "../middlewares/addCategories.validate.js";
import getPaginateDataValidate from "../middlewares/getPaginateData.validate.js";
import getPreferredValidate from "../middlewares/getPreferred.validate.js";
import searchValidate from "../middlewares/search.validate.js";
import updateCategoryValidate from "../middlewares/updateCategory.validate.js";

// Remember what moderator can do. Admin can do (specially here)
const categoryRoutes = Router();

// Admin can add categories
categoryRoutes.post(
    "/categories",
    isAuthenticated,
    isModerator,
    addCategoriesValidate,
    addCategories
);

// Anyone can see the categories
categoryRoutes.get("/categories", getPaginateDataValidate, getCategories);

// Admin can see the preferred categories
categoryRoutes.get(
    "/categories/preferred",
    isAuthenticated,
    isModerator,
    getPreferredValidate,
    getPreferred
);

// Admin can search for categories (he get one additional info)
categoryRoutes.get(
    "/categories/preferred/search",
    isAuthenticated,
    isModerator,
    searchValidate,
    searchCategories
);

// Users can search for categories
categoryRoutes.get("/categories/search", searchValidate, userSearchCategory);

// Admin can delete categories
categoryRoutes.delete(
    "/categories/:categoryId",
    isAuthenticated,
    isModerator,
    deleteCategory
);

// Admin can edit category data
categoryRoutes.patch(
    "/categories/:categoryId",
    isAuthenticated,
    isModerator,
    updateCategoryValidate,
    updateCategory
);

categoryRoutes.get("/categories/:categoryId", getCategoriesDetails);

export default categoryRoutes;
