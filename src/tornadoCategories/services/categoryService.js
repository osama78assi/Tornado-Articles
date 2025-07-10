import { Op, QueryTypes } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";
import { MIN_RESULTS } from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import Category from "../models/category.js";

class ErrorsEnum {
    static COULDNOT_DELETE = new APIError(
        "Category isn't exist or it's already deleted.",
        400,
        "CATEGORY_NOT_FOUND"
    );

    static CATEGORY_NOT_FOUND = (id) =>
        new APIError(
            `The category with id '${id}' isn't found`,
            400,
            "NOT_FOUND"
        );

    static INVALID_CATEGORY_ID = new APIError(
        "The category id must be string number",
        400,
        "VALIDATION_ERROR"
    );
}

class CategoryService {
    static async addCategories(categoriesData) {
        try {
            const categories = await Category.bulkCreate(categoriesData);

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

    static async updateCategory(categoryId, newTitle, newDescription) {
        let updateObj = {};

        if (newTitle) {
            updateObj.title = newTitle;
        }

        if (newDescription) {
            updateObj.description = newDescription;
        }

        try {
            const updatedObject = await Category.update(updateObj, {
                where: {
                    id: categoryId,
                },
                returning: true,
            });

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

    static async getPreferredCategories(
        entryInterestedCounts,
        entryItemTitle,
        limit
    ) {
        try {
            // It will be headach to write it with sequelize so plain is better with parameterized query (to avoid injection)
            const q = `
                SELECT "Categories".id, "Categories".title, "Categories".description,"Categories"."createdAt", COALESCE("Counts"."interestCounts", 0) as "interestCounts"
                FROM "Categories" LEFT JOIN (
                    SELECT "categoryId", COUNT("categoryId") as "interestCounts" FROM "UserPreferences"
                    GROUP BY "categoryId"
                ) AS "Counts"
                ON "Categories".id = "Counts"."categoryId"
                WHERE
                COALESCE("Counts"."interestCounts", 0) < :entryInterestedCounts OR
                (COALESCE("Counts"."interestCounts", 0) = :entryInterestedCounts AND "Categories".title > :entryItemTitle)
                ORDER BY COALESCE("Counts"."interestCounts", 0) DESC, "Categories".title ASC
                LIMIT :limit;
            `;

            const categories = await sequelize.query(q, {
                type: QueryTypes.SELECT,
                replacements: {
                    entryInterestedCounts:
                        entryInterestedCounts === Number.POSITIVE_INFINITY
                            ? "9223372036854775807" // Bigest big integer in postgresql
                            : entryInterestedCounts,
                    entryItemTitle,
                    limit,
                },
                // benchmark: true,
                // logging: function (sql, timeMs) {
                //     loggingService.emit("query-time-usage", { sql, timeMs });
                // },
            });
            return categories;
        } catch (err) {
            throw err;
        }
    }

    static async getCategoryDetails(id) {
        try {
            if (/^\d+$/.test(String(id))) throw ErrorsEnum.INVALID_CATEGORY_ID;

            const category = await Category.findByPk(id);

            if (category === null) throw ErrorsEnum.CATEGORY_NOT_FOUND(id);

            return category;
        } catch (err) {
            throw err;
        }
    }

    static async userSearchCategories(query, lastEntryTitle, limit) {
        try {
            const results = await Category.findAll({
                where: {
                    title: {
                        [Op.iLike]: `${query}%`,
                        [Op.gt]: lastEntryTitle,
                    },
                },
                order: [["title", "ASC"]],
                limit,
            });

            return results;
        } catch (err) {
            throw err;
        }
    }

    static async adminSearchCategories(query, lastEntryTitle, limit) {
        try {
            // For the same reason it will be messy if builded with sequelize
            const q = `
                SELECT "Categories".id, "Categories".title, "Categories".description,"Categories"."createdAt", COALESCE("Counts"."interestCounts", 0) as "interestCounts"
                FROM "Categories" LEFT JOIN (
                    SELECT "categoryId", COUNT("categoryId") as "interestCounts" FROM "UserPreferences"
                    GROUP BY "categoryId"
                ) AS "Counts"
                ON "Categories".id = "Counts"."categoryId"
                WHERE
                "Categories".title ILIKE :query AND "Categories".title > :lastEntryTitle
                ORDER BY "Categories".title ASC
                LIMIT :limit;
            `;

            const results = await sequelize.query(q, {
                replacements: {
                    query: `${query}%`,
                    lastEntryTitle,
                    limit,
                },
                type: QueryTypes.SELECT,
            });

            return results;
        } catch (err) {}
    }
}

export default CategoryService;
