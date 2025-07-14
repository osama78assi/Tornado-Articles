import { Op } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";
import { MIN_RESULTS } from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import Category from "../../tornadoCategories/models/category.js";
import Topic from "../../tornadoCategories/models/topic.js";
import UserPreference from "../models/userPreference.js";
import UserTopic from "../models/userTopic.js";

class ErrorsEnum {
    static DATA_DUPLICATED = (typeOfData) =>
        new APIError(
            `There is one ${typeOfData} (or more) that you are already interested in`,
            409,
            "DUPLICATED_VALUE_ERROR"
        );
}

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
            if (err?.name === "SequelizeUniqueConstraintError")
                throw ErrorsEnum.DATA_DUPLICATED("category");
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
                    individualHooks: true,
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
                        exclude: ["createdAt", "description"],
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

    static async addPreferredTopics(userId, topicsIds) {
        try {
            // The records we want to add
            const zip = topicsIds.map((topicId) => {
                return {
                    userId,
                    topicId,
                };
            });

            const data = await UserTopic.bulkCreate(zip);

            return data;
        } catch (err) {
            if (err?.name === "SequelizeUniqueConstraintError")
                throw ErrorsEnum.DATA_DUPLICATED("topic");
            throw err;
        }
    }

    static async getPreferredTopics(
        userId,
        entryItemTitle,
        getAfter,
        limit = MIN_RESULTS
    ) {
        try {
            const dir = getAfter
                ? { [Op.gt]: entryItemTitle }
                : { [Op.lt]: entryItemTitle };

            const preferredTopics = await UserTopic.findAll({
                attributes: [],
                where: {
                    userId,
                    "$Topic.title$": dir,
                },
                include: {
                    model: Topic,
                    attributes: {
                        exclude: ["createdAt", "description"],
                    },
                },
                order: [[{ model: Topic }, "title", "ASC"]],
                limit,
                // benchmark: true,
                // logging: function (sql, timeMs) {
                //     loggingService.emit("query-time-usage", { sql, timeMs });
                // },
            });

            return preferredTopics.map((prefTopic) => {
                return prefTopic.dataValues.Topic;
            });
        } catch (err) {
            throw err;
        }
    }

    static async updatePreferredTopics(userId, toAdd = [], toDelete = []) {
        // Start unmanaged transaction
        const t = await sequelize.transaction();

        // Zip the toAdd
        const toAddZip = toAdd.map((topicId) => {
            return {
                userId,
                topicId,
            };
        });

        try {
            // If there is something to add
            // Add the new items. Pass the transaction
            toAddZip.length !== 0 &&
                (await UserTopic.bulkCreate(toAddZip, {
                    transaction: t,
                    individualHooks: true,
                }));

            // If no errors happened let's do the same for delete
            toDelete.length !== 0 &&
                (await UserTopic.destroy({
                    where: {
                        topicId: {
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
}

export default UserPreferenceService;
