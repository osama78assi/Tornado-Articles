const { Router } = require("express");
const adminAddCategories = require("../controllers/category/adminAddCategories");
const adminDeleteCategory = require("../controllers/category/adminDeleteCategory");
const isAuthenticated = require("../middlewares/isAuthenticated");
const isAdmin = require("../middlewares/isAdmin");
const adminUpdateCategory = require("../controllers/category/adminUpdateCategory");
const getCategories = require("../controllers/category/getCategories");

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
categoryRoutes.get('/categories', getCategories);
module.exports = categoryRoutes;
