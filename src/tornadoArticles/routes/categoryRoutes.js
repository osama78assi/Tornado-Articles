import { Router } from "express";
import adminAddCategories from "../controllers/category/adminAddCategories";
import adminDeleteCategory from "../controllers/category/adminDeleteCategory";
import adminUpdateCategory from "../controllers/category/adminUpdateCategory";
import getCategories from "../controllers/category/getCategories";

import isAdmin from "../../../publicMiddlewares/isAdmin";
import isAuthenticated from "../../../publicMiddlewares/isAuthenticated";

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
