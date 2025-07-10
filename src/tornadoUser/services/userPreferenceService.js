import { Op } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";
import { MIN_RESULTS } from "../../../config/settings.js";
import Category from "../../tornadoCategories/models/category.js";
import UserPreference from "../models/userPreference.js";

class UserPreferenceService {
    static async addPreferredCategories(userId, categoriesIds) {
        try {
            // The records we want to add
            const zip = categoriesIds.map((categoryId) => {
                return {
                    userId,
                    categoryId,
                };
            });

            const data = await UserPreference.bulkCreate(zip);

            return data;
        } catch (err) {
            throw err;
        }
    }

    static async updatePreferredCategories(userId, toAdd = [], toDelete = []) {
        // Start unmanaged transaction
        const t = await sequelize.transaction();

        // Zip the toAdd
        const toAddZip = toAdd.map((categoryId) => {
            return {
                userId,
                categoryId,
            };
        });

        try {
            // If there is something to add
            // Add the new items. Pass the transaction
            toAddZip.length !== 0 &&
                (await UserPreference.bulkCreate(toAddZip, {
                    transaction: t,
                }));

            // If no errors happened let's do the same for delete
            toDelete.length !== 0 &&
                (await UserPreference.destroy({
                    where: {
                        categoryId: {
                            [Op.in]: toDelete, // If faced any ID from this array delete it
                        },
                    },
                    transaction: t,
                }));

            // No error happened ? commit
            await t.commit();
        } catch (err) {
            console.log(err);
            // any error ? rolback and throw that error
            await t.rollback();
            throw err;
        }
    }

    static async getPreferredCategories(
        userId,
        entryItemTitle,
        getAfter,
        limit = MIN_RESULTS
    ) {
        try {
            const dir = getAfter
                ? { [Op.gt]: entryItemTitle }
                : { [Op.lt]: entryItemTitle };

            const preferredCategories = await UserPreference.findAll({
                attributes: [],
                where: {
                    userId,
                    "$Category.title$": dir,
                },
                include: {
                    model: Category,
                    attributes: {
                        exclude: ["createdAt"],
                    },
                },
                order: [[{ model: Category }, "title", "ASC"]],
                limit,
                // benchmark: true,
                // logging: function (sql, timeMs) {
                //     loggingService.emit("query-time-usage", { sql, timeMs });
                // },
            });

            return preferredCategories.map((prefCategory) => {
                return prefCategory.dataValues.Category;
            });
        } catch (err) {
            throw err;
        }
    }

    static async getPreferredCategoriesBetweenRates(
        userId,
        firstCategoryRate,
        lastCategoryRate,
        firstCategoryId,
        lastCategoryId,
        limit
    ) {
        try {
            const categories = await UserPreference.findAll({
                attributes: ["categoryId", "interestRate"],
                where: {
                    userId,

                    [Op.or]: [
                        {
                            interestRate: {
                                // Take the range
                                [Op.lt]: firstCategoryRate,
                                [Op.gt]: lastCategoryRate,
                            },
                        },
                        // And when the rates is the same take the range according to the id
                        {
                            interestRate: lastCategoryRate,
                            categoryId: {
                                [Op.lte]: firstCategoryId,
                                [Op.gte]: lastCategoryId,
                            },
                        },
                    ],
                },
                order: [
                    ["interestRate", "DESC"],
                    ["categoryId", "DESC"],
                ],
                limit,
            });

            return categories;
        } catch (err) {
            throw err;
        }
    }

    static async getPreferredCategoriesAfterRate(
        userId,
        lastCategoryRate,
        lastCategoryId,
        limit
    ) {
        try {
            const categories = await UserPreference.findAll({
                attributes: ["categoryId", "interestRate"],
                where: {
                    userId,

                    [Op.or]: [
                        {
                            // Less in rate first
                            interestRate: {
                                [Op.lt]: lastCategoryRate,
                            },
                        },
                        {
                            // When the rate is equal take less ID
                            interestRate: lastCategoryRate,
                            categoryId: {
                                [Op.lt]: lastCategoryId,
                            },
                        },
                    ],
                },
                order: [
                    ["interestRate", "DESC"],
                    ["categoryId", "DESC"],
                ],
                limit,
            });

            return categories;
        } catch (err) {
            throw err;
        }
    }
}

export default UserPreferenceService;
