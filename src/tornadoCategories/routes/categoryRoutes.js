import { Router } from "express";
import adminAddCategories from "../controllers/adminAddCategories.js";
import adminDeleteCategory from "../controllers/adminDeleteCategory.js";
import adminUpdateCategory from "../controllers/adminUpdateCategory.js";
import getCategories from "../controllers/getCategories.js";

import isAdmin from "../../../publicMiddlewares/isAdmin.js";
import isAuthenticated from "../../../publicMiddlewares/isAuthenticated.js";

const categoryRoutes = Router();

// Admin can add categories
categoryRoutes.post(
    "/admin/categories",
    isAuthenticated,
    isAdmin,
    adminAddCategories
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
    adminUpdateCategory
);

// Anyone can see the categories
categoryRoutes.get("/categories", getCategories);

export default categoryRoutes;
