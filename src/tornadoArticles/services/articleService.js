import { ForeignKeyConstraintError, Op } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";
import { MIN_RESULTS } from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import User from "../../auth/models/user.js";
import Category from "../../tornadoCategories/models/category.js";
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
        // SELECT *, ts_rank(to_tsvector('english', title), to_tsquery(:searchFor)) AS rank
        // from "Articles" WHERE to_tsvector('english', title) @@ to_tsquery(:searchFor)
        // ORDER BY rank DESC ,"createdAt" DESC
        // LIMIT :results OFFSET :startAt
        // `;

        // Optimized query
        let query = `
            SELECT sub.*, ts_rank(a.data, to_tsquery(:searchFor)) AS rank
            FROM (
                SELECT *, to_tsvector('english', title) AS data
                FROM "Articles"
            ) sub
            WHERE sub.data @@ to_tsquery(:searchFor)
            ORDER BY rank DESC, "createdAt" DESC
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
        tags
    ) {
        // Start unmanaged transaction
        const t = await sequelize.transaction();
        try {
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
                },
                { transaction: t }
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
            await User.increment("articleCounts", {
                where: { id: userId },
                transaction: t,
            });

            await t.commit();
            return article.dataValues.id;
        } catch (err) {
            await t.rollback();
            // Due to complex relation I will make some of them readable
            if (err instanceof ForeignKeyConstraintError) {
                if (err.table === "ArticleCategories")
                    throw new APIError(
                        "One of the categroies isn't exists",
                        404,
                        "CATEGORY_NOT_FOUND"
                    );
            }
            throw err;
        }
    }

    static async getArticleDetails(articleId) {
        try {
            const article = await Article.findOne({
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
                            exclude: ["createdAt"],
                        },
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
                    },
                    {
                        // May not be used but let's get the images urls
                        model: ArticleImage,
                        attributes: ["image"], // Only get the image
                    },
                ],
            });

            if (!article)
                throw new APIError(
                    "The article either deleted or not existed in first place.",
                    404,
                    "ARTICLE_NOT_FOUND"
                );

            return article;
        } catch (err) {
            throw err;
        }
    }

    static async getLatestArticlesGuests(
        offset = 0,
        limit = MIN_RESULTS,
        since
    ) {
        try {
            const articles = await Article.findAll({
                attributes: [
                    "id",
                    "title",
                    "createdAt",
                    "coverImg",
                    "language",
                    "minsToRead",
                ],
                include: {
                    // Get some info about the publisher
                    model: User,
                    as: "publisher",
                    attributes: ["id", "fullName", "profilePic", "gender"],
                },
                where: {
                    private: false,
                    createdAt: {
                        [Op.lte]: since,
                    },
                },
                offset,
                limit,
                order: [
                    ["rank", "DESC"],
                    ["createdAt", "DESC"],
                ],
            });

            return articles;
        } catch (err) {
            throw err;
        }
    }
}

export default ArticleService;
