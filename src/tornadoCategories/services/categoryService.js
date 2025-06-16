import { MIN_RESULTS } from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import normalizeOffsetLimit from "../../../util/normalizeOffsetLimit.js";
import Category from "../models/category.js";

class CategoryService {
    static async addCategories(categoriesTitles) {
        try {
            const titles = categoriesTitles.map((categoryTitle) => {
                return {
                    title: categoryTitle,
                };
            });

            const categories = await Category.bulkCreate(titles);

            return categories;
        } catch (err) {
            throw err;
        }
    }

    static async deleteCategory(categoryId) {
        try {
            const affectedRows = await Category.destroy({
                where: {
                    id: categoryId,
                },
            });

            if (affectedRows === 0)
                throw new APIError(
                    "Category isn't exist or it's already deleted.",
                    400,
                    "CATEGORY_NOT_FOUND"
                );

            return affectedRows;
        } catch (err) {
            throw err;
        }
    }

    static async updateCategoryTitle(categoryId, newTitle) {
        try {
            const updatedObject = await Category.update(
                {
                    title: newTitle,
                },
                {
                    where: {
                        id: categoryId,
                    },
                    returning: true,
                }
            );

            return updatedObject[1][0];
        } catch (err) {
            throw err;
        }
    }

    static async getCategories(offset = 0, limit = MIN_RESULTS) {
        ({ offset, limit } = normalizeOffsetLimit(offset, limit));
        try {
            const categories = await Category.findAll({
                offset,
                limit,
            });

            return categories;
        } catch (err) {
            throw err;
        }
    }
}

export default CategoryService;
