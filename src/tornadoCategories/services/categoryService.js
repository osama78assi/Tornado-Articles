import { Op } from "sequelize";
import { MIN_RESULTS } from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import Category from "../models/category.js";

class ErrorsEnum {
    static COULDNOT_DELETE = new APIError(
        "Category isn't exist or it's already deleted.",
        400,
        "CATEGORY_NOT_FOUND"
    );
}

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

            if (affectedRows === 0) throw ErrorsEnum.COULDNOT_DELETE;

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

    static async getCategories(entryItemTitle, getAfter, limit = MIN_RESULTS) {
        try {
            const dir = getAfter
                ? { [Op.gt]: entryItemTitle }
                : { [Op.lt]: entryItemTitle };

            const categories = await Category.findAll({
                where: {
                    title: dir,
                },
                limit,
                order: [["title", "ASC"]],
            });

            return categories;
        } catch (err) {
            throw err;
        }
    }
}

export default CategoryService;
