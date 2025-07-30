import { Op } from "sequelize";
import { ARTICLE_ATTRIBUTES } from "../../../config/settings.js";
import User from "../../auth/models/user.js";
import Category from "../../tornadoCategories/models/category.js";
import Topic from "../../tornadoCategories/models/topic.js";
import FollowingService from "../../tornadoUser/services/followingService.js";
import UserPreferenceService from "../../tornadoUser/services/userPreferenceService.js";
import Article from "../models/article.js";
import Tag from "../models/tag.js";
import {
    extractCategoriesRanges,
    extractFollowingRanges,
    extractTopicsRanges,
} from "../util/index.js";

// It's a good idea to seperate this in another service. judging by the code lines
class RecommendationService {
    static async getFreshArticles(
        limit,
        lastArticleRank,
        lastArticleId,
        categories,
        topics,
        ignore
    ) {
        try {
            let articles = await Article.findAll({
                attributes: ARTICLE_ATTRIBUTES,
                include: [
                    {
                        // Get the necessary info about the publisher
                        model: User,
                        as: "publisher",
                        attributes: ["id", "fullName", "profilePic", "gender"],
                    },
                    {
                        model: Category,
                        // as: "categories",
                        // through: {
                        //     attributes: [], // Don't include anything from junction table
                        // },
                        attributes: ["id", "title"],
                        as: "category",

                        // // If passed categories filter by them
                        // ...(categories.length > 0 && {
                        //     where: {
                        //         id: { [Op.in]: categories },
                        //     },
                        // }),
                    },
                    {
                        // Get the topics
                        model: Topic,
                        attributes: ["id", "title"],
                        through: {
                            attributes: [],
                        },
                        as: "topics",

                        // If he wants topics filter by them
                        ...(topics.length > 0 && {
                            where: {
                                id: { [Op.in]: topics },
                            },
                        }),
                    },
                    {
                        model: Tag,
                        as: "tags",
                        through: {
                            attributes: [],
                        },
                    },
                ],
                where: {
                    id: {
                        [Op.notIn]: ignore,
                    },
                    private: false,
                    [Op.or]: [
                        {
                            freshRank: {
                                [Op.lt]: lastArticleRank,
                            },
                        },
                        {
                            freshRank: lastArticleRank,
                            id: {
                                [Op.lt]: lastArticleId,
                            },
                        },
                    ],
                    // If passed categories filter by them
                    ...(categories.length > 0 && {
                        categoryId: { [Op.in]: categories },
                    }),
                },
                limit,
                order: [
                    ["freshRank", "DESC"],
                    ["id", "DESC"],
                ],
                // benchmark: true,
                // logging: function (sql, timeMs) {
                //     loggingService.emit("query-time-usage", { sql, timeMs });
                // },
            });

            // As the filter on categories. Not all categories for the article will be back from the query
            articles = this._attachAllTopics(articles);

            return articles;
        } catch (err) {
            throw err;
        }
    }

    static async getOptimalArticles(
        limit,
        categories,
        topics,
        lastArticleId,
        lastArticleRank,
        ignore = []
    ) {
        try {
            let compareId = {};
            // If there is a provided id compare with it
            if (lastArticleId !== "")
                compareId = {
                    optimalRank: lastArticleRank, // If they have the same rank
                    id: { [Op.lt]: lastArticleId }, // Then take where the id is less (snowflake guarantee that the id is sorted naturally by timestamp)
                };

            let articles = await Article.findAll({
                attributes: [...ARTICLE_ATTRIBUTES, "optimalRank"],
                include: [
                    {
                        // Get the necessary info about the publisher
                        model: User,
                        as: "publisher",
                        attributes: ["id", "fullName", "profilePic", "gender"],
                    },
                    {
                        model: Category,
                        // as: "categories",
                        // through: {
                        //     attributes: [],
                        // },
                        attributes: ["id", "title"],
                        as: "category",
                        // ...(categories.length > 0 && {
                        //     where: {
                        //         id: { [Op.in]: categories },
                        //     },
                        // }),
                    },
                    {
                        // Get the topics
                        model: Topic,
                        attributes: ["id", "title"],
                        through: {
                            attributes: [],
                        },
                        as: "topics",

                        // Again if he wants topics filter by them
                        ...(topics.length > 0 && {
                            where: {
                                id: { [Op.in]: topics },
                            },
                        }),
                    },
                    {
                        model: Tag,
                        as: "tags",
                        through: {
                            attributes: [],
                        },
                    },
                ],
                where: {
                    id: {
                        [Op.notIn]: ignore,
                    },
                    private: false,
                    [Op.or]: [
                        {
                            optimalRank: {
                                [Op.lt]: lastArticleRank, // Take less than provided article
                            },
                        },
                        compareId, // If there is equality take this
                    ],

                    ...(categories.length > 0 && {
                        categoryId: { [Op.in]: categories },
                    }),
                },
                limit,
                order: [
                    ["optimalRank", "DESC"],
                    ["id", "DESC"],
                ],
            });

            // As the filter on categories. Not all categories for the article will be back from the query
            articles = this._attachAllTopics(articles);

            return articles;
        } catch (err) {
            throw err;
        }
    }

    static async getArticlesFollowingFresh(
        followedId,
        lastArticleRank,
        lastArticleId,
        firstPublisherId,
        lastPublisherId,
        firstPublisherRate,
        lastPublisherRate,
        ignore,
        articlesLimit,
        followingsLimit,
        keepTheRange = true // To specify if you want to save the range or get new one
    ) {
        try {
            let followingsIds = null;
            let followingsRates = {
                firstPublisherRate: null,
                lastPublisherRate: null,
            };
            let followingsIdsRange = {
                firstPublisherId: null,
                lastPublisherId: null,
            };

            // Either save the range
            if (keepTheRange) {
                followingsIds =
                    await FollowingService.getFollowingsBetweenRates(
                        followedId,
                        firstPublisherRate,
                        lastPublisherRate,
                        firstPublisherId,
                        lastPublisherId,
                        followingsLimit
                    );
            } else {
                // Or get another one after the last rate
                followingsIds = await FollowingService.getFollowingsAfterRate(
                    followedId,
                    lastPublisherRate,
                    lastPublisherId,
                    followingsLimit
                );
            }

            // Take IDs, Rate range, and first and last publisher id
            ({ followingsIds, followingsIdsRange, followingsRates } =
                extractFollowingRanges(followingsIds));

            // Get the articles for those followings
            // After getting the followings get article for them
            const articles = await Article.findAll({
                attributes: ARTICLE_ATTRIBUTES,
                where: {
                    id: {
                        [Op.notIn]: ignore,
                    },
                    private: false,
                    userId: {
                        [Op.in]: followingsIds,
                    },
                    [Op.or]: [
                        {
                            freshRank: {
                                [Op.lt]: lastArticleRank,
                            },
                        },
                        {
                            freshRank: lastArticleRank,
                            id: {
                                [Op.lt]: lastArticleId,
                            },
                        },
                    ],
                },
                include: [
                    {
                        // Get the article categories
                        model: Category,
                        // through: {
                        //     attributes: [],
                        // },
                        // as: "categories",
                        as: "category",
                        attributes: ["id", "title"],
                    },
                    {
                        // Get the topics
                        model: Topic,
                        attributes: ["id", "title"],
                        through: {
                            attributes: [],
                        },
                        as: "topics",
                    },
                    {
                        // Get the tags
                        model: Tag,
                        through: {
                            attributes: [],
                        },
                        attributes: {
                            exclude: ["createdAt"],
                        },
                        as: "tags",
                    },
                ],
                order: [
                    ["freshRank", "DESC"],
                    ["id", "DESC"],
                ],
                limit: articlesLimit,
                // benchmark: true,
                // logging: (sql, timeMs) => {
                //     loggingService.emit("query-time-usage", { sql, timeMs });
                // },
            });

            // Extract all necessary information
            return {
                articles,
                publishersIds: followingsIdsRange,
                interestRateRange: followingsRates,
                lastArticleId:
                    articles?.at(-1)?.dataValues?.id ?? "9223372036854775807", // Give default value for more API friendly
                lastArticleRank:
                    articles?.at(-1)?.dataValues?.freshRank ??
                    String(Number.POSITIVE_INFINITY),
            };
        } catch (err) {
            throw err;
        }
    }

    static async getArticlesFollowingOptimal(
        followedId,
        firstPublisherId,
        lastPublisherId,
        lastPublisherRate,
        firstPublisherRate,
        followingsLimit,
        keepTheRange,
        articlesLimit,
        lastArticleRank,
        lastArticleId,
        ignore
    ) {
        try {
            let followingsIds = null;
            let followingsRates = {
                firstPublisherRate: null,
                lastPublisherRate: null,
            };
            let followingsIdsRange = {
                firstPublisherId: null,
                lastPublisherId: null,
            };

            // Either save the range
            if (keepTheRange) {
                followingsIds =
                    await FollowingService.getFollowingsBetweenRates(
                        followedId,
                        firstPublisherRate,
                        lastPublisherRate,
                        firstPublisherId,
                        lastPublisherId,
                        followingsLimit
                    );
            } else {
                // Or get another one after the last rate
                followingsIds = await FollowingService.getFollowingsAfterRate(
                    followedId,
                    lastPublisherRate,
                    lastPublisherId,
                    followingsLimit
                );
            }

            // Take IDs, Rate range, and first and last publisher id
            ({ followingsIds, followingsIdsRange, followingsRates } =
                extractFollowingRanges(followingsIds));

            // Get the articles for those followings
            // After getting the followings get article for them
            const articles = await Article.findAll({
                attributes: [...ARTICLE_ATTRIBUTES, "optimalRank"],
                where: {
                    id: {
                        [Op.notIn]: ignore,
                    },
                    private: false,
                    userId: {
                        [Op.in]: followingsIds,
                    },
                    [Op.or]: [
                        {
                            optimalRank: {
                                [Op.lt]: lastArticleRank,
                            },
                        },
                        {
                            optimalRank: lastArticleRank,
                            id: {
                                [Op.lt]: lastArticleId,
                            },
                        },
                    ],
                },
                include: [
                    {
                        // Get the article categories
                        model: Category,
                        // through: {
                        //     attributes: [],
                        // },
                        // as: "categories",
                        as: "category",
                        attributes: ["id", "title"],
                    },
                    {
                        // Get the topics
                        model: Topic,
                        attributes: ["id", "title"],
                        through: {
                            attributes: [],
                        },
                        as: "topics",
                    },
                    {
                        // Get the tags
                        model: Tag,
                        through: {
                            attributes: [],
                        },
                        attributes: {
                            exclude: ["createdAt"],
                        },
                        as: "tags",
                    },
                ],
                order: [
                    ["optimalRank", "DESC"],
                    ["id", "DESC"],
                ],
                limit: articlesLimit,
                // benchmark: true,
                // logging: (sql, timeMs) => {
                //     loggingService.emit("query-time-usage", { sql, timeMs });
                // },
            });

            // Extract all necessary information
            return {
                articles,
                publishersIds: followingsIdsRange,
                interestRateRange: followingsRates,
                lastArticleId:
                    articles?.at(-1)?.dataValues?.id ?? "9223372036854775807", // Give default value for more API friendly
                lastArticleRank:
                    articles?.at(-1)?.dataValues?.optimalRank ??
                    String(Number.POSITIVE_INFINITY), // You can notify the user to take current date in his time
            };
        } catch (err) {
            throw err;
        }
    }

    static async getArticlesCategoriesFresh(
        userId,
        firstInterestRate,
        lastInterestRate,
        firstCategoryId,
        lastCategoryId,
        categoriesLimit,
        lastArticleRank,
        lastArticleId,
        ignore,
        articlesLimit,
        keepTheRange
    ) {
        try {
            let categoriesIdsRange = {
                firstCategoryId: null,
                lastCategoryId: null,
            };

            let categoriesRates = {
                firstCategoryRate: null,
                lastCategoryRate: null,
            };

            let categoriesIds = null;

            if (keepTheRange) {
                categoriesIds =
                    await UserPreferenceService.getPreferredCategoriesBetweenRates(
                        userId,
                        firstInterestRate,
                        lastInterestRate,
                        firstCategoryId,
                        lastCategoryId,
                        categoriesLimit
                    );
            } else {
                categoriesIds =
                    await UserPreferenceService.getPreferredCategoriesAfterRate(
                        userId,
                        lastInterestRate,
                        lastCategoryId,
                        categoriesLimit
                    );
            }

            // Extract the rangess
            ({ categoriesIds, categoriesIdsRange, categoriesRates } =
                extractCategoriesRanges(categoriesIds));

            // Use the same function but send the categories
            let articles = await this.getFreshArticles(
                articlesLimit,
                lastArticleRank,
                lastArticleId,
                categoriesIds,
                [], // Pass empty topics list
                ignore
            );

            return {
                articles,
                categoriesIds: categoriesIdsRange,
                categoriesRates,
                lastArticleId:
                    articles?.at(-1)?.dataValues?.id ?? "9223372036854775807", // Give default value for more API friendly
                lastArticleRank:
                    articles?.at(-1)?.dataValues?.freshRank ??
                    String(Number.POSITIVE_INFINITY),
            };
        } catch (err) {
            throw err;
        }
    }

    static async getArticlesCategoriesOptimal(
        userId,
        firstInterestRate,
        lastInterestRate,
        firstCategoryId,
        lastCategoryId,
        categoriesLimit,
        lastArticleRank,
        lastArticleId,
        ignore,
        articlesLimit,
        keepTheRange
    ) {
        try {
            let categoriesIdsRange = {
                firstCategoryId: null,
                lastCategoryId: null,
            };

            let categoriesRates = {
                firstCategoryRate: null,
                lastCategoryRate: null,
            };

            let categoriesIds = null;

            if (keepTheRange) {
                categoriesIds =
                    await UserPreferenceService.getPreferredCategoriesBetweenRates(
                        userId,
                        firstInterestRate,
                        lastInterestRate,
                        firstCategoryId,
                        lastCategoryId,
                        categoriesLimit
                    );
            } else {
                categoriesIds =
                    await UserPreferenceService.getPreferredCategoriesAfterRate(
                        userId,
                        lastInterestRate,
                        lastCategoryId,
                        categoriesLimit
                    );
            }

            // Extract the rangess
            ({ categoriesIds, categoriesIdsRange, categoriesRates } =
                extractCategoriesRanges(categoriesIds));

            // Use the same function but send the categories
            let articles = await this.getOptimalArticles(
                articlesLimit,
                categoriesIds,
                [], // Pass empty topics array
                lastArticleId,
                lastArticleRank,
                ignore
            );

            return {
                articles,
                categoriesIds: categoriesIdsRange,
                categoriesRates,
                lastArticleId:
                    articles?.at(-1)?.dataValues?.id ?? "9223372036854775807", // Give default value for more API friendly
                lastArtilceCRank:
                    articles?.at(-1)?.dataValues?.optimalRank ??
                    String(Number.POSITIVE_INFINITY), // You can notify the user to take current date in his time
            };
        } catch (err) {
            throw err;
        }
    }

    static async getArticlesTopicsFresh(
        userId,
        firstInterestRate,
        lastInterestRate,
        firstTopicId,
        lastTopicId,
        topicsLimit,
        lastArticleRank,
        lastArticleId,
        ignore,
        articlesLimit,
        keepTheRange
    ) {
        try {
            let topicsIdsRange = {
                firstTopicId: null,
                lastTopicId: null,
            };

            let topicsRates = {
                firstTopicRate: null,
                lastTopicRate: null,
            };

            let topicsIds = null;

            if (keepTheRange) {
                topicsIds =
                    await UserPreferenceService.getPreferredTopicsBetweenRates(
                        userId,
                        firstInterestRate,
                        lastInterestRate,
                        firstTopicId,
                        lastTopicId,
                        topicsLimit
                    );
            } else {
                topicsIds =
                    await UserPreferenceService.getPreferredTopicsAfterRate(
                        userId,
                        lastInterestRate,
                        lastTopicId,
                        topicsLimit
                    );
            }

            // Extract the rangess
            ({ topicsIds, topicsIdsRange, topicsRates } =
                extractTopicsRanges(topicsIds));

            // Use the same function but send the categories
            let articles = await this.getFreshArticles(
                articlesLimit,
                lastArticleRank,
                lastArticleId,
                [], // Pass empty array as categories
                topicsIds,
                ignore
            );

            return {
                articles,
                topicsIds: topicsIdsRange,
                topicsRates: topicsRates,
                lastArticleId:
                    articles?.at(-1)?.dataValues?.id ?? "9223372036854775807", // Give default value for more API friendly
                lastArticleRank:
                    articles?.at(-1)?.dataValues?.freshRank ??
                    String(Number.POSITIVE_INFINITY),
            };
        } catch (err) {
            throw err;
        }
    }

    static async getArticlesTopicsOptimal(
        userId,
        firstInterestRate,
        lastInterestRate,
        firstTopicId,
        lastTopicId,
        topicsLimit,
        lastArticleRank,
        lastArticleId,
        ignore,
        articlesLimit,
        keepTheRange
    ) {
        try {
            let topicsIdsRange = {
                firstTopicId: null,
                lastTopicId: null,
            };

            let topicsRates = {
                firstTopicRate: null,
                lastTopicRate: null,
            };

            let topicsIds = null;

            if (keepTheRange) {
                topicsIds =
                    await UserPreferenceService.getPreferredTopicsBetweenRates(
                        userId,
                        firstInterestRate,
                        lastInterestRate,
                        firstTopicId,
                        lastTopicId,
                        topicsLimit
                    );
            } else {
                topicsIds =
                    await UserPreferenceService.getPreferredTopicsAfterRate(
                        userId,
                        lastInterestRate,
                        lastTopicId,
                        topicsLimit
                    );
            }

            // Extract the rangess
            ({ topicsIds, topicsIdsRange, topicsRates } =
                extractTopicsRanges(topicsIds));

            // Use the same function but send the categories
            let articles = await this.getOptimalArticles(
                articlesLimit,
                [], // Pass empty categories array
                topicsIds,
                lastArticleId,
                lastArticleRank,
                ignore
            );

            return {
                articles,
                topicsIds: topicsIdsRange,
                topicsRates,
                lastArticleId:
                    articles?.at(-1)?.dataValues?.id ?? "9223372036854775807", // Give default value for more API friendly
                lastArtilceCRank:
                    articles?.at(-1)?.dataValues?.optimalRank ??
                    String(Number.POSITIVE_INFINITY), // You can notify the user to take current date in his time
            };
        } catch (err) {
            throw err;
        }
    }

    // This helper methods don't use them outside the class
    static async _attachAllTopics(articles) {
        try {
            let articlesCatTopics = [];

            if (articles.length) {
                let mapIdToIndex = {}; // This will be helpful

                let articlesIds = articles.map((article, i) => {
                    mapIdToIndex[article.dataValues.id] = i; // This will reduce one nested loop later
                    return article.dataValues.id;
                });

                // This is fast enough using the primary key and no need to additional relation setup in database/index.js
                articlesCatTopics = await Article.findAll({
                    subQuery: false,
                    attributes: ["id"],
                    where: {
                        id: {
                            [Op.in]: articlesIds, // Exctract articles Ids
                        },
                    },
                    include: [
                        {
                            // Get the categories
                            model: Category,
                            attributes: ["id", "title"],
                            // as: "categories",
                            // through: {
                            //     attributes: [],
                            // },
                            as: "category",
                        },
                        // Get the topics
                        {
                            attributes: ["id", "title"],
                            model: Topic,
                            through: {
                                attributes: [],
                            },
                            as: "topics",
                        },
                    ],
                });

                // Attach the categories to articles using the map between ids and indexes
                articlesCatTopics.forEach((article) => {
                    // Get the id
                    let articleId = article.dataValues.id;

                    // Get the index of that Id and change its categories
                    // articles[mapIdToIndex[articleId]].dataValues.categories =
                    //     article.dataValues.categories;

                    // And the topics
                    articles[mapIdToIndex[articleId]].dataValues.topics =
                        article.dataValues.topics;
                });
            }

            return articles;
        } catch (err) {
            throw err;
        }
    }
}

export default RecommendationService;
