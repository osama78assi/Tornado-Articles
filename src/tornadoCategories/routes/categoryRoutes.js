import { Router } from "express";
import adminAddCategories from "../controllers/adminAddCategories.js";
import adminDeleteCategory from "../controllers/adminDeleteCategory.js";
import adminUpdateCategory from "../controllers/adminUpdateCategory.js";
import getCategories from "../controllers/getCategories.js";

import isAdmin from "../../../publicMiddlewares/isAdmin.js";
import isAuthenticated from "../../../publicMiddlewares/isAuthenticated.js";
import adminGetPreferred from "../controllers/adminGetPreferred.js";
import adminSearchCategories from "../controllers/adminSearchCategories.js";
import getCategoriesDetails from "../controllers/getCategoryDetails.js";
import userSearchCategory from "../controllers/userSearchCategory.js";
import adminAddCategoriesValidate from "../middlewares/adminAddCategories.validate.js";
import adminGetPreferredValidate from "../middlewares/adminGetPreferred.validate.js";
import adminUpdateCategoryValidate from "../middlewares/adminUpdateCategory.validate.js";
import getCategoriesValidate from "../middlewares/getCategory.validate.js";
import searchCategoryValidate from "../middlewares/searchCategory.validate.js";

const categoryRoutes = Router();

// Admin can add categories
categoryRoutes.post(
    "/admin/categories",
    isAuthenticated,
    isAdmin,
    adminAddCategoriesValidate,
    adminAddCategories
);

// Adimn can see the preferred categories
categoryRoutes.get(
    "/admin/categories/preferred",
    isAuthenticated,
    isAdmin,
    adminGetPreferredValidate,
    adminGetPreferred
);

// Admin can search for categories (he get one additional info)
categoryRoutes.get(
    "/admin/categories/search",
    isAuthenticated,
    isAdmin,
    searchCategoryValidate,
    adminSearchCategories
);

// Users can search for categories
categoryRoutes.get(
    "/categories/search",
    searchCategoryValidate,
    userSearchCategory
);

// Admin can delete categories
categoryRoutes.delete(
    "/admin/categories/:categoryId",
    isAuthenticated,
    isAdmin,
    adminDeleteCategory
);

// Admin can edit category title
categoryRoutes.patch(
    "/admin/categories/:categoryId",
    isAuthenticated,
    isAdmin,
    adminUpdateCategoryValidate,
    adminUpdateCategory
);

// Anyone can see the categories
categoryRoutes.get("/categories", getCategoriesValidate, getCategories);

categoryRoutes.get("/categories/:categoryId", getCategoriesDetails);

export default categoryRoutes;
