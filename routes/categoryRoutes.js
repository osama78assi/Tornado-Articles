const {Router } = require('express');
const adminAddCategories = require('../controllers/category/adminAddCategories');

const categoryRoutes = Router();

// Admin can add categories
categoryRoutes.post('/admin/categories', adminAddCategories);

module.exports = categoryRoutes;