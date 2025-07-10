import { ForeignKeyConstraintError, Op } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";
import { PUBLISH_ARTICLE_LIMIT } from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import {
    extractCategoriesRanges,
    extractFollowingRanges,
} from "../../../util/extractRanges.js";
import isPassedTimeBy from "../../../util/isPassedTimeBy.js";
import User from "../../auth/models/user.js";
import Category from "../../tornadoCategories/models/category.js";
import FollowingService from "../../tornadoUser/services/followingService.js";
import TornadoUserService from "../../tornadoUser/services/tornadoUserService.js";
import UserPreferenceService from "../../tornadoUser/services/userPreferenceService.js";
import Article from "../models/article.js";
import ArticleCategory from "../models/articleCategory.js";
import ArticleImage from "../models/articleImage.js";
import ArticleTag from "../models/articleTag.js";
import Tag from "../models/tag.js";
import TagService from "../services/tagService.js";

// TODO: There is a direct connection between the models. Encapsulate it throw services

// TODO: Flexible search using GIN index and the powerfull postgreSQL engine
// ts_rank will give the search result a rank by number and quality of matches.
async function searchByTitle() {
    try {
        let searchFor = "HEllo there";
        // let query = `
        // SELECT *, ts_rank(to_tsvector('english', title), to_tsquery(:searchFor)) AS articleRank
        // from "Articles" WHERE to_tsvector('english', title) @@ to_tsquery(:searchFor)
        // ORDER BY articleRank DESC ,"createdAt" DESC
        // LIMIT :results OFFSET :startAt
        // `;

        // Optimized query
        let query = `
            SELECT sub.*, ts_rank(a.data, to_tsquery(:searchFor)) AS articleRank
            FROM (
                SELECT *, to_tsvector('english', title) AS data
                FROM "Articles"
            ) sub
            WHERE sub.data @@ to_tsquery(:searchFor)
            ORDER BY articleRank DESC, "createdAt" DESC
            LIMIT :results OFFSET :startAt;
        `;

        sequelize.query(query, {
            replacements: {
                searchFor: searchFor.replace(/\s+/g, " | "),
                startAt: 0,
                results: 10,
            },
            type: QueryTypes.SELECT,
        });
    } catch (err) {
        console.log(err);
    }
}

class ErrorsEnum {
    static CATEGORY_NOT_FOUND = new APIError(
        "One of the categroies isn't exists",
        404,
        "CATEGORY_NOT_FOUND"
    );

    static ARTICLE_NOT_FOUND = new APIError(
        "The article either deleted or not existed in first place.",
        404,
        "ARTICLE_NOT_FOUND"
    );

    static ARTICLE_PUBLISH_LIMIT = new APIError(
        `You can't publish new article now. Every ${PUBLISH_ARTICLE_LIMIT} you can publish a new article.`,
        429,
        "PUBLISH_LIMIT_EXCEEDED"
    );

    static BANNED_FROM_PUBLISH = new APIError(
        `Sorry you are banned from publishing any new article right now`,
        403,
        "BANNED"
    );
}

class ArticleService {
    // When edit some attributes it will be helpfull
    static _searchArticleAttrs = [
        "id",
        "title",
        "createdAt",
        "coverImg",
        "language",
        "minsToRead",
        "headline",
        "score",
    ];

    static async publishArticle(
        userId,
        title,
        content,
        isPrivate,
        language,
        coverPic,
        contentPics,
        categories,
        tags,
        headline
    ) {
        // Start unmanaged transaction
        const t = await sequelize.transaction();
        try {
            // Get the user data. There is two limitation (last publishing time and ban)
            // And I will be able to get the old article counts (because I want to add the date of publishing with it)
            const userData = await TornadoUserService.getUserById(userId);

            if (
                userData.dataValues.articlePublishedAt !== null &&
                !isPassedTimeBy(
                    new Date(),
                    userData.dataValues.articlePublishedAt,
                    PUBLISH_ARTICLE_LIMIT
                )
            )
                throw ErrorsEnum.ARTICLE_PUBLISH_LIMIT;

            if (
                userData.dataValues.banTill !== null &&
                userData.dataValues.banTill < new Date()
            )
                throw ErrorsEnum.BANNED_FROM_PUBLISH;

            // Add the article
            const article = await Article.create(
                {
                    title,
                    content,
                    private: isPrivate,
                    language,
                    coverImg: coverPic,
                    userId,
                    titleTsVector: sequelize.fn("to_tsvector", language, title),
                    headline,
                },
                {
                    transaction: t,
                }
            );

            // Add the images
            // zip the content images
            if (contentPics.length !== 0) {
                const zip = contentPics.map((contentPic) => {
                    return {
                        articleId: article.dataValues.id,
                        image: contentPic,
                    };
                });

                await ArticleImage.bulkCreate(zip, { transaction: t });
            }

            // Add the categories
            if (categories.length !== 0) {
                // Create the ZIP
                const zip = categories.map((categoryId) => {
                    return {
                        categoryId,
                        articleId: article.dataValues.id,
                    };
                });

                // Create the relations
                await ArticleCategory.bulkCreate(zip, { transaction: t });
            }

            // Now add the tags.
            if (tags.length !== 0) {
                // Create the tags if not exists
                const tagsData = await TagService.addTags(tags, t);

                // If one tag is existed we need its id because the previouse function return new id
                const existedTags = await TagService.getTagsByNames(tags);

                // Create the object to hold the data
                const finalTags = {};

                // tagName is unique so valid as object's keys
                // Start from the created one because it contains all tags the user added
                tagsData.forEach((tag) => {
                    finalTags[tag.dataValues.tagName] = tag.dataValues.id; // Assign the tagName: tagId
                });

                existedTags.forEach((tag) => {
                    finalTags[tag.dataValues.tagName] = tag.dataValues.id; // If the tag existed Article will contain the correct id
                });

                // Create the zip. Looping over values
                const zip = Object.values(finalTags).map((tagId) => {
                    return {
                        tagId,
                        articleId: article.dataValues.id,
                    };
                });

                // Create the relation
                await ArticleTag.bulkCreate(zip, {
                    transaction: t,
                });
            }

            // Increase the articles count by 1
            await TornadoUserService.addNewArticle(
                userId,
                userData.dataValues.articleCounts,
                t
            );

            await t.commit();
            return article.dataValues.id;
        } catch (err) {
            await t.rollback();
            // Due to complex relation I will make some of them readable
            if (
                err instanceof ForeignKeyConstraintError &&
                err.table === "ArticleCategories"
            )
                throw ErrorsEnum.CATEGORY_NOT_FOUND;

            throw err;
        }
    }

    static async getArticleDetails(articleId) {
        try {
            const article = await Article.findOne({
                subQuery: false,
                where: {
                    id: articleId,
                },
                attributes: {
                    exclude: ["titleTsVector", "userId"],
                },
                include: [
                    {
                        // Get the article publisher
                        model: User,
                        as: "publisher",
                        attributes: ["id", "fullName", "profilePic", "gender"],
                    },
                    {
                        // Get the article categories
                        model: Category,
                        through: {
                            attributes: [], // Don't include anything from junction table
                        },
                        attributes: {
                            exclude: ["createdAt", "description"],
                        },
                        as: "categories",
                    },
                    {
                        // Get the tags
                        model: Tag,
                        through: {
                            attributes: [], // Don't add anything from junction table
                        },
                        attributes: {
                            exclude: ["createdAt"],
                        },
                        as: "tags",
                    },
                    {
                        // Get the article images. If exists
                        model: ArticleImage,
                        attributes: ["image"], // Only get the image
                        as: "articleImages",
                    },
                ],
                // benchmark: true,
                // logging: function (sql, timeMs) {
                //     loggingService.emit("query-time-usage", { sql, timeMs });
                // },
            });

            if (!article) throw ErrorsEnum.ARTICLE_NOT_FOUND;

            return article;
        } catch (err) {
            throw err;
        }
    }

    static async getFreshArticles(
        limit,
        since,
        lastArticleId,
        categories,
        ignore
    ) {
        try {
            let articles = await Article.findAll({
                attributes: this._searchArticleAttrs,
                include: [
                    {
                        // Get the necessary info about the publisher
                        model: User,
                        as: "publisher",
                        attributes: ["id", "fullName", "profilePic", "gender"],
                    },
                    {
                        model: Category,
                        as: "categories",
                        through: {
                            attributes: [], // Don't include anything from junction table
                        },
                        attributes: {
                            exclude: ["createdAt", "description"],
                        },
                        ...(categories.length > 0 && {
                            where: {
                                id: { [Op.in]: categories },
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
                            createdAt: {
                                [Op.lt]: since,
                            },
                        },
                        {
                            createdAt: since,
                            id: {
                                [Op.lt]: lastArticleId,
                            },
                        },
                    ],
                },
                limit,
                order: [
                    ["createdAt", "DESC"],
                    ["id", "DESC"],
                ],
            });

            // As the filter on categories. Not all categories for the article will be back from the query
            articles = this._attachAllCategories(articles);

            return articles;
        } catch (err) {
            throw err;
        }
    }

    static async getOptimalArticles(
        limit,
        categories,
        lastArticleId,
        lastArticleRank = Number.POSITIVE_INFINITY,
        ignore = []
    ) {
        try {
            let compareId = {};
            // If there is a provided id compare with it
            if (lastArticleId !== "")
                compareId = {
                    articleRank: lastArticleRank, // If they have the same rank
                    id: { [Op.lt]: lastArticleId }, // Then take where the id is less (snowflake guarantee that the id is sorted naturally by timestamp)
                };

            let articles = await Article.findAll({
                attributes: this._searchArticleAttrs,
                include: [
                    {
                        // Get the necessary info about the publisher
                        model: User,
                        as: "publisher",
                        attributes: ["id", "fullName", "profilePic", "gender"],
                    },
                    {
                        model: Category,
                        as: "categories",
                        through: {
                            attributes: [],
                        },
                        attributes: {
                            exclude: ["createdAt", "description"],
                        },
                        ...(categories.length > 0 && {
                            where: {
                                id: { [Op.in]: categories },
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
                            articleRank: {
                                [Op.lt]: lastArticleRank, // Take less than provided article
                            },
                        },
                        compareId, // If there is equality take this
                    ],
                },
                limit,
                order: [
                    ["articleRank", "DESC"],
                    ["id", "DESC"],
                ],
            });

            // As the filter on categories. Not all categories for the article will be back from the query
            articles = this._attachAllCategories(articles);

            return articles;
        } catch (err) {
            throw err;
        }
    }

    static async getArticlesFollowingFresh(
        followedId,
        since,
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
                attributes: this._searchArticleAttrs,
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
                            createdAt: {
                                [Op.lt]: since,
                            },
                        },
                        {
                            createdAt: since,
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
                        through: {
                            attributes: [],
                        },
                        attributes: {
                            exclude: ["createdAt", "description"],
                        },
                        as: "categories",
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
                    ["createdAt", "DESC"],
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
                lastArtilceCreatedAt:
                    articles?.at(-1)?.dataValues?.createdAt ?? new Date(), // You can notify the user to take current date in his time
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
                attributes: this._searchArticleAttrs,
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
                            articleRank: {
                                [Op.lt]: lastArticleRank,
                            },
                        },
                        {
                            articleRank: lastArticleRank,
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
                        through: {
                            attributes: [],
                        },
                        attributes: {
                            exclude: ["createdAt", "description"],
                        },
                        as: "categories",
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
                    ["articleRank", "DESC"],
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
                    articles?.at(-1)?.dataValues?.articleRank ??
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
        since,
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

            // Etract the rangess
            ({ categoriesIds, categoriesIdsRange, categoriesRates } =
                extractCategoriesRanges(categoriesIds));

            // Use the same function but send the categories
            let articles = await this.getFreshArticles(
                articlesLimit,
                since,
                lastArticleId,
                categoriesIds,
                ignore
            );

            return {
                articles,
                categoriesIds: categoriesIdsRange,
                categoriesRates,
                lastArticleId:
                    articles?.at(-1)?.dataValues?.id ?? "9223372036854775807", // Give default value for more API friendly
                lastArtilceCreatedAt:
                    articles?.at(-1)?.dataValues?.createdAt ?? new Date(), // You can notify the user to take current date in his time
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

            // Etract the rangess
            ({ categoriesIds, categoriesIdsRange, categoriesRates } =
                extractCategoriesRanges(categoriesIds));

            // Use the same function but send the categories
            let articles = await this.getOptimalArticles(
                articlesLimit,
                categoriesIds,
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
                    articles?.at(-1)?.dataValues?.articleRank ??
                    String(Number.POSITIVE_INFINITY), // You can notify the user to take current date in his time
            };
        } catch (err) {
            throw err;
        }
    }

    // This helper methods don't use them outside the class
    static async _attachAllCategories(articles) {
        try {
            let articlesCategories = [];
            if (articles.length) {
                let mapIdToIndex = {}; // This will be helpful

                let articlesIds = articles.map((article, i) => {
                    mapIdToIndex[article.dataValues.id] = i; // This will reduce one nested loop later
                    return article.dataValues.id;
                });

                // This is fast enough using the primary key and no need to additional relation setup in database/index.js
                articlesCategories = await Article.findAll({
                    attributes: ["id"],
                    where: {
                        id: {
                            [Op.in]: articlesIds, // Exctract articles Ids
                        },
                    },
                    include: {
                        attributes: ["id", "title"],
                        model: Category,
                        as: "categories",
                        through: {
                            attributes: [],
                        },
                    },
                });

                // Attach the categories to articles using the map between ids and indexes
                articlesCategories.forEach((category) => {
                    // Get the id
                    let articleId = category.dataValues.id;

                    // Get the index of that Id and change its categories
                    articles[mapIdToIndex[articleId]].dataValues.categories =
                        category.dataValues.categories;
                });
            }

            return articles;
        } catch (err) {
            throw err;
        }
    }
}

export default ArticleService;
