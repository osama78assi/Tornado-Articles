const { sequelize } = require("../config/sequelize");
const {
    Model,
    DataTypes,
    QueryTypes,
    EagerLoadingError,
} = require("sequelize");

// Models to add relations
const User = require("./user");
const Category = require("./category");
const ArticleLike = require("./articleLike");
const Comment = require("./comment");
const ArticleCategory = require("./articleCategory");
const ArticleImage = require("./articleImage");
const Tag = require("./tag");
const ArticleTag = require("./articleTag");
const OperationError = require("../util/operationError");
const { MIN_RESULTS } = require("../config/settings");
const normalizeOffsetLimit = require("../util/normalizeOffsetLimit");

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

class Article extends Model {
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
            const article = await this.create(
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
                const tagsData = await Tag.addTags(tags, t);

                // If one tag is existed we need its id because the previouse function return new id
                const existedTags = await Tag.getTagsByNames(tags);

                // Create the object to hold the data
                const finalTags = {};

                // tagName is unique so valid as object's keys
                // Start from the created one because it contains all tags the user added
                tagsData.forEach((tag) => {
                    finalTags[tag.dataValues.tagName] = tag.dataValues.id; // Assign the tagName: tagId
                });

                existedTags.forEach((tag) => {
                    finalTags[tag.dataValues.tagName] = tag.dataValues.id; // If the tag existed this will contain the correct id
                });

                console.log("\n\n###########", finalTags, "\n\n###########");

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

            await t.commit();
            return article.dataValues.id;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    static async getArticleDetails(articleId) {
        try {
            const article = await this.findOne({
                where: {
                    id: articleId,
                },
                attributes: {
                    exclude: ["titleTsVector", "userId"],
                    include: [
                        [
                            // Comments count
                            sequelize.literal(`(
                            SELECT COUNT("articleId")
                            FROM "Comments"
                            WHERE "Comments"."articleId" = "Article"."id"
                        )`),
                            "commentCounts",
                        ],
                        [
                            // Likes count
                            sequelize.literal(`(
                                SELECT COUNT("articleId")
                                FROM "ArticleLikes"
                                WHERE "ArticleLikes"."articleId" = "Article"."id"
                            )`),
                            "likeCounts",
                        ],
                    ],
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
                throw new OperationError(
                    "The article either deleted or not existed in first place.",
                    404
                );

            return article;
        } catch (err) {
            throw err;
        }
    }

    static async getLatestArticles(offset = 0, limit = MIN_RESULTS) {
        ({ offset, limit } = normalizeOffsetLimit(offset, limit));
        try {
            const articles = await this.findAll({
                attributes: [
                    "id",
                    "title",
                    "createdAt",
                    "coverImg",
                    "language",
                    [
                        sequelize.literal(`(
                            SELECT COUNT("articleId")
                            FROM "ArticleLikes"
                            WHERE "articleId" = "Article"."id"
                        )`),
                        "likesCount",
                    ],
                    [
                        sequelize.literal(`(
                            SELECT COUNT("articleId")
                            FROM "Comments"
                            WHERE "articleId" = "Article"."id"
                        )`),
                        "commentsCount",
                    ],
                ],
                include: {
                    // Get some info about the publisher
                    model: User,
                    as: "publisher",
                    attributes: ["id", "fullName", "profilePic", "gender"],
                },

                offset,
                limit,
                order: [["createdAt", "DESC"]],
            });

            return articles;
        } catch (err) {
            throw err;
        }
    }
}

Article.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                len: {
                    args: 5,
                    msg: ["Article title should at least made of 5 chars"],
                },
            },
        },
        language: {
            type: DataTypes.ENUM("english"),
            allowNull: false,
            defaultValue: "english",
        },
        titleTsVector: {
            type: DataTypes.TSVECTOR,
            allowNull: false,
            // This got a trigger check config/sequelize.js
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                len: {
                    args: 10,
                    msg: "Title content should be at least made of 10 chars",
                },
            },
        },
        private: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        userId: {
            type: DataTypes.UUID,
            references: {
                model: "Users",
                key: "id",
            },
            allowNull: false,
            onDelete: "CASCADE", // When the user delete his/her account. Delete his/her articles
        },
        coverImg: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
    },
    {
        sequelize,
        timestamp: true,
        indexes: [
            {
                name: "user_id_articles_btree_index", // Getting articles for a publisher is faster now
                fields: ["userId", "createdAt"],
                using: "BTREE",
            },
        ],
        hooks: {
            beforeCreate(article) {
                // Trim the content and title
                article.dataValues.title = article.dataValues.title.trim();
                // Normalize the header
                article.dataValues.title =
                    article.dataValues.title.toLocaleLowerCase();

                article.dataValues.content = article.dataValues.content.trim();
            },
            beforeUpdate(article) {
                // Trim the content and title
                if (article.changed("title")) {
                    article.dataValues.title = article.dataValues.title.trim();
                    article.dataValues.title =
                        article.dataValues.title.toLocaleLowerCase();
                }
                if (article.changed("content"))
                    article.dataValues.content =
                        article.dataValues.content.trim();
            },
        },
    }
);

///// Images
// The article can have many images so 1:m relationship
Article.hasMany(ArticleImage, {
    foreignKey: "articleId",
});

///// Users

// Many-to-one with users
Article.belongsTo(User, {
    foreignKey: "userId",
    onDelete: "CASCADE",
    as: "publisher",
});

// one-to-many relation
User.hasMany(Article, {
    foreignKey: "userId",
    onDelete: "CASCADE",
    as: "articles",
});

///// Categories
// Many to many relation with categories
Article.belongsToMany(Category, {
    through: ArticleCategory,
    foreignKey: "articleId",
});

// Set the relations
Category.belongsToMany(Article, {
    through: ArticleCategory,
    foreignKey: "categoryId",
});

/////////// Tags
Article.belongsToMany(Tag, {
    through: ArticleTag,
    foreignKey: "articleId",
});

Tag.belongsToMany(Article, {
    through: ArticleTag,
    foreignKey: "tagId",
});

/////////// Likes
// Many-to-Many relation with users through likes
Article.belongsToMany(User, {
    through: ArticleLike,
    foreignKey: "articleId",
    otherKey: "userId",
});

// Maybe needed when user want to know where he added likes so we will get the article from the like
// The relation between articles and like (mtm from users and articles through likes)
ArticleLike.belongsTo(Article, { foreignKey: "articleId" }); // NO NEED

// Many-to-many between users and aritcles through likes
User.belongsToMany(Article, {
    through: ArticleLike,
    foreignKey: "userId",
    otherKey: "articleId",
});

/////// Comments
// Many-to-Many relation with users through comments
Article.belongsToMany(User, {
    through: { model: Comment, unique: false },
    foreignKey: "articleId",
});

// Many-to-many between users and aritcles through commnets
User.belongsToMany(Article, {
    // Let the user comment times
    through: { model: Comment, unique: false },
    foreignKey: "userId",
});

// We want to get the user by comment or article by comment

// One-to-Many relation between comments and articles
Comment.belongsTo(Article, { foreignKey: "articleId" });

// Same for users
Comment.belongsTo(User, { foreignKey: "userId" });

module.exports = Article;
