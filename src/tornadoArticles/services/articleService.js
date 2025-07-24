import { ForeignKeyConstraintError, Op } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";
import {
    ARTICLE_ATTRIBUTES,
    ARTICLE_CONTENT_UPDATE_LIMIT,
    ARTICLE_PREFERENCES_UPDATE_LIMIT,
    ARTICLE_TAGS_UPDATE_LIMIT,
    ARTICLE_TITLE_LANGUAGE_UPDATE_LIMIT,
    MAX_CATEGORIES_ARTICLE_COUNT,
    MAX_TOPICS_ARTICLE_COUNT,
    PUBLISH_ARTICLE_LIMIT,
} from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import generateDateAfter from "../../../util/generateDateAfter.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import isPassedTimeBy from "../../../util/isPassedTimeBy.js";
import User from "../../auth/models/user.js";
import Category from "../../tornadoCategories/models/category.js";
import Topic from "../../tornadoCategories/models/topic.js";
import TopicService from "../../tornadoCategories/services/topicService.js";
import ModeratorActionService from "../../tornadoPlatform/services/moderatorActionService.js";
import TornadoUserService from "../../tornadoUser/services/tornadoUserService.js";
import Article from "../models/article.js";
import ArticleCategory from "../models/articleCategory.js";
import ArticleImage from "../models/articleImage.js";
import ArticleLimit from "../models/articleLimit.js";
import ArticleTag from "../models/articleTag.js";
import ArticleTopic from "../models/articleTopic.js";
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

    static TOPIC_NOT_FOUND = new APIError(
        "One of the topics isn't exists",
        404,
        "TOPIC_NOT_FOUND"
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

    static TOPIC_WITHOUT_CATEGORY = new APIError(
        "One of the topics haven't their category associated with it. Topic must have its category",
        400,
        "VALIDATION_ERROR"
    );

    static COULDNOT_DELETE = new APIError(
        "couldn't delete the article or it's already deleted",
        400,
        "VALIDATION_ERROR"
    );

    static ARTICLE_NOT_FOR_USER = new APIError(
        "The article isn't for the user. You can't delete it",
        401,
        "NOT_AUTHORIZED"
    );

    static UPDATE_TITLE_LANG_LIMIT = (canUpdateAt) =>
        new APIError(
            `You can't update this article's (title or language) right now. You can update them after last update by ${ARTICLE_TITLE_LANGUAGE_UPDATE_LIMIT}`,
            429,
            "UPDATE_TITLE_LANGUAGE_LIMIT",
            [["canUpdateAt", canUpdateAt]]
        );

    static UPDATE_CONTENT_LIMIT = (canUpdateAt) =>
        new APIError(
            `You can't update this article's content right now. You can update content after last update by ${ARTICLE_CONTENT_UPDATE_LIMIT}`,
            429,
            "UPDATE_CONTENT_LIMIT",
            [["canUpdateAt", canUpdateAt]]
        );

    static CATEGORIES_MAX_LIMIT = new APIError(
        `The article can have up to ${MAX_CATEGORIES_ARTICLE_COUNT} categroies`,
        400,
        "CATEGORIES_MAX_LIMIT"
    );

    static TOPICS_MAX_LIMIT = new APIError(
        `The article can have up to ${MAX_TOPICS_ARTICLE_COUNT} topics`,
        400,
        "TOPICS_MAX_LIMIT"
    );

    static CATEGORY_ALREADY_ATTACHED = new APIError(
        "There is a category that is already attached to the article",
        409,
        "DUPLICATED_VALUE_ERROR"
    );

    static TOPIC_ALREADY_ATTACHED = new APIError(
        "There is a topic that is already attached to the article",
        409,
        "DUPLICATED_VALUE_ERROR"
    );

    static TAG_ALREADY_ATTACHED = new APIError(
        "There is a tag that is already attached to the article",
        409,
        "DUPLICATED_VALUE_ERROR"
    );

    static UPDATE_PREFERENCES_LIMIT = (canUpdateAt) =>
        new APIError(
            `You can't change categories and topics for this article right now. You can change them after last change by ${ARTICLE_PREFERENCES_UPDATE_LIMIT}`,
            429,
            "UPDATE_PREFERENCES_LIMIT",
            [["canUpdateAt", canUpdateAt]]
        );

    static UPDATE_TAGS_LIMIT = (canUpdateAt) =>
        new APIError(
            `You can't change tags for this article right now. You can change them after last change by ${ARTICLE_TAGS_UPDATE_LIMIT}`,
            429,
            "UPDATE_TAGS_LIMIT",
            [["canUpdateAt", canUpdateAt]]
        );
}

class ArticleService {
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
        headline,
        topics
    ) {
        // Start unmanaged transaction
        const t = await sequelize.transaction();
        try {
            // Get the user data. There is two updates (last publishing time and ban)
            const userData = await TornadoUserService.getUserProps(
                userId,
                ["articleCounts"],
                ["articlePublishedAt", "banTill"]
            );

            if (
                userData.limits.articlePublishedAt !== null &&
                !isPassedTimeBy(
                    new Date(),
                    userData.limits.articlePublishedAt,
                    PUBLISH_ARTICLE_LIMIT
                )
            )
                throw ErrorsEnum.ARTICLE_PUBLISH_LIMIT;

            if (
                userData.limits.banTill !== null &&
                userData.limits.banTill < new Date()
            )
                throw ErrorsEnum.BANNED_FROM_PUBLISH;

            if (topics.length > 0) {
                // Let's check the topics if they are related to the passed categories or not
                const isFound = await TopicService.isTopicsContainedIn(
                    topics,
                    categories
                );

                if (isFound === null || !isFound)
                    throw ErrorsEnum.TOPIC_WITHOUT_CATEGORY;
            }

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

            if (topics.length > 0) {
                // Create the zip
                const zip = topics.map((topicId) => {
                    return {
                        articleId: article.dataValues.id,
                        topicId,
                    };
                });

                // Create the relations
                await ArticleTopic.bulkCreate(zip, {
                    transaction: t,
                });
            }

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

            // Now create the limit
            await ArticleLimit.create(
                {
                    articleId: article.dataValues.id,
                    canUpdateTitleLangAt: null,
                    canUpdateContentAt: null,
                    canChangePreferencesAt: null,
                    canChangeTagsAt: null,
                },
                {
                    transaction: t,
                }
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

            if (
                err instanceof ForeignKeyConstraintError &&
                err.table === "ArticleTopics"
            )
                throw ErrorsEnum.TOPIC_NOT_FOUND;
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
                        attributes: ["id", "title"],
                        as: "categories",
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

            if (!article) throw GlobalErrorsEnum.ARTICLE_NOT_FOUND(articleId);

            return article;
        } catch (err) {
            throw err;
        }
    }

    static async deleteArticle(articleId, userId, userEmail, userName, reason) {
        const t = await sequelize.transaction();
        try {
            const deletedCounts = await Article.destroy({
                where: {
                    id: articleId,
                },
                transaction: t,
            });

            if (deletedCounts === 0) throw ErrorsEnum.COULDNOT_DELETE;

            // Create the record
            await ModeratorActionService.addDeleteArticleRecord(
                userId,
                userEmail,
                userName,
                reason,
                t
            );

            await t.commit();

            return deletedCounts;
        } catch (err) {
            await t.rollback();

            throw err;
        }
    }

    static async isArticleForUser(articleId, userId, attributes = ["userId"]) {
        try {
            const articleData = await Article.findByPk(articleId, {
                attributes,
            });

            if (
                articleData?.dataValues?.userId !== undefined &&
                articleData?.dataValues?.userId !== userId
            )
                throw GlobalErrorsEnum.NOT_AUTHORIZED;

            return articleData;
        } catch (err) {
            throw err;
        }
    }

    static async getArticleProps(articleId, props = []) {
        try {
            if (!/^\d+$/.test(articleId))
                throw GlobalErrorsEnum.INVALID_BIGINT_ID("articleId");

            const article = await Article.findByPk(articleId, {
                attributes: props,
            });

            return article;
        } catch (err) {
            throw err;
        }
    }

    static async getArticlesFor(
        limit,
        since,
        lastEntryId,
        authorId,
        includePrivate = false
    ) {
        try {
            const articles = await Article.findAll({
                where: {
                    userId: authorId,
                    createdAt: {
                        // Less than passed date
                        [Op.lt]: since,
                    },

                    // In case the same date (nearly impossible in this case accroding to the cooldown for publsihing articles)
                    [Op.or]: {
                        createdAt: since,
                        id: {
                            [Op.lt]: lastEntryId,
                        },
                    },

                    ...(!includePrivate ? { private: false } : {}),
                },
                attributes: [...ARTICLE_ATTRIBUTES, "private"],
                limit,
                order: [
                    ["createdAt", "DESC"],
                    ["id", "ASC"],
                ],
                // benchmark: true,
                // logging: function (sql, timeMs) {
                //     loggingService.emit("query-time-usage", { sql, timeMs });
                // },
            });

            return articles;
        } catch (err) {
            throw err;
        }
    }

    static async updateArticle(
        articleId,
        isPrivate,
        minsToRead,
        language,
        title,
        headline
    ) {
        const t = await sequelize.transaction();
        try {
            if (title !== undefined || language !== undefined) {
                // Get the limits
                const articleLimit = await ArticleLimit.findByPk(articleId, {
                    attributes: ["canUpdateTitleLangAt"],
                });

                // Check
                if (
                    articleLimit.dataValues.canUpdateTitleLangAt !== null &&
                    new Date(articleLimit.dataValues.canUpdateTitleLangAt) >
                        new Date()
                )
                    throw ErrorsEnum.UPDATE_TITLE_LANG_LIMIT(
                        articleLimit.dataValues.canUpdateTitleLangAt
                    );

                // Update the limit if you can
                await ArticleLimit.update(
                    {
                        canUpdateTitleLangAt: generateDateAfter(
                            ARTICLE_TITLE_LANGUAGE_UPDATE_LIMIT
                        ),
                    },
                    {
                        where: {
                            articleId,
                        },
                        transaction: t,
                    }
                );
            }

            // Update the data
            await Article.update(
                {
                    title,
                    private: isPrivate,
                    minsToRead,
                    language,
                    headline,
                },
                {
                    where: {
                        id: articleId,
                    },
                    validate: true, // Run the validator
                    transaction: t,
                }
            );

            // Everything is fine then commit
            await t.commit();
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    static async getArticleImages(articleId) {
        try {
            const articleImages = await ArticleImage.findAll({
                attributes: ["image"],
                where: { articleId },
            });

            return articleImages.map((article) => article.dataValues.image);
        } catch (err) {
            throw err;
        }
    }

    static async updateArticleContent(articleId, content, contentPics, images) {
        const t = await sequelize.transaction();
        try {
            // Check if the article's content can be edited
            const articleLimit = await ArticleLimit.findByPk(articleId, {
                attributes: ["canUpdateContentAt"],
            });

            if (
                articleLimit.dataValues.canUpdateContentAt !== null &&
                new Date(articleLimit.dataValues.canUpdateContentAt) >
                    new Date()
            )
                throw ErrorsEnum.UPDATE_CONTENT_LIMIT(
                    articleLimit.dataValues.canUpdateContentAt
                );

            // Delete the images from the ArticleImage model
            await ArticleImage.destroy({
                where: {
                    articleId,
                    image: {
                        [Op.in]: images,
                    },
                },
                transaction: t,
            });

            // Add the new images if provided
            if (contentPics.length > 0) {
                // Create the Zip
                const zip = contentPics.map((contentPic) => {
                    return {
                        articleId,
                        image: contentPic,
                    };
                });

                await ArticleImage.bulkCreate(zip, { transaction: t });
            }

            // Update the content and cover image if passed
            await Article.update(
                {
                    content,
                },
                {
                    where: { id: articleId },
                    validate: true,
                    transaction: t,
                }
            );

            // Update the limit
            await ArticleLimit.update(
                {
                    canUpdateContentAt: generateDateAfter(
                        ARTICLE_CONTENT_UPDATE_LIMIT
                    ),
                },
                { where: { articleId }, transaction: t }
            );

            await t.commit();
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    static async updateArticleCover(articleId, coverPic) {
        try {
            await Article.update(
                { coverImg: coverPic },
                {
                    where: {
                        id: articleId,
                    },
                }
            );
        } catch (err) {
            throw err;
        }
    }

    static async updateArticleCategoriesTopics(
        articleId,
        addCategories,
        addTopics
    ) {
        const t = await sequelize.transaction();
        try {
            const articleLimit = await ArticleLimit.findByPk(articleId, {
                attributes: ["canChangePreferencesAt"],
            });

            if (
                articleLimit.canChangePreferencesAt !== null &&
                new Date(articleLimit.canChangePreferencesAt) > new Date()
            )
                throw ErrorsEnum.UPDATE_PREFERENCES_LIMIT(
                    articleLimit.canChangePreferencesAt
                );

            // Get the topcis and categories for the article
            const article = await Article.findByPk(articleId, {
                attributes: ["id"],
                include: [
                    {
                        // Get the article categories
                        model: Category,
                        through: {
                            attributes: [], // Don't include anything from junction table
                        },
                        attributes: ["id"],
                        as: "categories",
                    },
                    {
                        // Get the topics
                        model: Topic,
                        attributes: ["id"],
                        through: {
                            attributes: [],
                        },
                        as: "topics",
                    },
                ],
            });

            // Extract topics and categories
            const topics = article.dataValues.topics.map((topic) => topic.id);
            const categories = article.dataValues.categories.map(
                (category) => category.id
            );

            // Remove the old categories and topics
            await ArticleTopic.destroy({
                where: {
                    topicId: {
                        [Op.in]: topics,
                    },
                    articleId,
                },
                transaction: t,
            });

            // Remove categories
            await ArticleCategory.destroy({
                where: {
                    categoryId: {
                        [Op.in]: categories,
                    },
                    articleId,
                },

                transaction: t,
            });

            if (addTopics.length > 0) {
                // Let's check the topics if they are related to the passed categories or not
                const isFound = await TopicService.isTopicsContainedIn(
                    topics,
                    categories
                );

                if (isFound === null || !isFound)
                    throw ErrorsEnum.TOPIC_WITHOUT_CATEGORY;
            }

            // When the article have the categories for the topics (or no topics provided)
            // Add them all
            if (addCategories.length > 0) {
                // Create the zip
                const zip = addCategories.map((categoryId) => {
                    return {
                        categoryId,
                        articleId,
                    };
                });

                await ArticleCategory.bulkCreate(zip, {
                    transaction: t,
                });
            }

            if (addTopics.length > 0) {
                // Create the zip
                const zip = addTopics.map((topicId) => {
                    return {
                        topicId,
                        articleId,
                    };
                });

                await ArticleTopic.bulkCreate(zip, {
                    transaction: t,
                });
            }

            await ArticleLimit.update(
                {
                    canChangePreferencesAt: generateDateAfter(
                        ARTICLE_PREFERENCES_UPDATE_LIMIT
                    ),
                },
                {
                    where: {
                        articleId,
                    },
                }
            );

            await t.commit();
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    static async updateArticleTags(articleId, addTags) {
        const t = await sequelize.transaction();
        try {
            const articleLimit = await ArticleLimit.findByPk(articleId, {
                attributes: ["canChangeTagsAt"],
            });

            if (
                articleLimit.canChangeTagsAt !== null &&
                new Date(articleLimit.canChangeTagsAt) > new Date()
            )
                throw ErrorsEnum.UPDATE_TAGS_LIMIT(
                    articleLimit.canChangeTagsAt
                );

            // Remvoe all old tags
            await ArticleTag.destroy({
                where: {
                    articleId,
                },
                transaction: t,
            });

            // Create the zip for adding tags
            if (addTags.length > 0) {
                const zip = addTags.map((tagId) => {
                    return {
                        tagId,
                        articleId,
                    };
                });

                await ArticleTag.bulkCreate(zip, {
                    transaction: t,
                });
            }

            await ArticleTag.update(
                {
                    canChangeTagsAt: generateDateAfter(
                        ARTICLE_TAGS_UPDATE_LIMIT
                    ),
                },
                {
                    where: {
                        articleId,
                    },
                }
            );

            await t.commit();
        } catch (err) {
            await t.rollback();

            // Make the error more readable
            if (
                err?.name === "SequelizeUniqueConstraintError" &&
                err?.parent?.table === "ArticleTags"
            ) {
                throw ErrorsEnum.TAG_ALREADY_ATTACHED;
            }
            throw err;
        }
    }
}

export default ArticleService;
