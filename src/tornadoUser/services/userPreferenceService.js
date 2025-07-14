import { Op } from "sequelize";
import { MIN_RESULTS } from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import Category from "../../tornadoCategories/models/category.js";
import Topic from "../../tornadoCategories/models/topic.js";
import UserCategories from "../models/userCategory.js";
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

            const data = await UserCategories.bulkCreate(zip);

            return data;
        } catch (err) {
            if (err?.name === "SequelizeUniqueConstraintError")
                throw ErrorsEnum.DATA_DUPLICATED("category");
            throw err;
        }
    }

    static async updatePreferredCategories(userId, categories = []) {
        try {
            await UserCategories.destroy({
                where: {
                    userId,
                    categoryId: {
                        [Op.in]: categories,
                    },
                },
            });
        } catch (err) {
            console.log(err);
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

            const preferredCategories = await UserCategories.findAll({
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
            const categories = await UserCategories.findAll({
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
            const categories = await UserCategories.findAll({
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

    static async removePreferredTopics(userId, topics = []) {
        try {
            const removedCount = await UserTopic.destroy({
                where: {
                    userId,
                    topicId: {
                        [Op.in]: topics, // If faced any ID from this array delete it
                    },
                },
            });

            return removedCount;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
}

export default UserPreferenceService;
