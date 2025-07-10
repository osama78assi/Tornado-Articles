import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";
import { MAX_ARTICLE_CONTENT_LENGTH } from "../../../config/settings.js";
import { generateSnowFlakeIdArticle } from "../../../config/snowFlake.js";
import APIError from "../../../util/APIError.js";

class Article extends Model {}

Article.init(
    {
        id: {
            type: DataTypes.BIGINT,
            defaultValue: () => generateSnowFlakeIdArticle(),
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(300),
            allowNull: false,
            validate: {
                isLargeEnough(title) {
                    if (title.length < 3) {
                        throw new APIError(
                            "Article title should at least made of 3 chars",
                            400,
                            "VALIDATION_ERROR"
                        );
                    }
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
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                isLargeEnough(content) {
                    if (content.length < 10) {
                        throw new APIError(
                            "Article content should be at least made of 10 chars",
                            400,
                            "VALIDATION_ERROR"
                        );
                    }
                },
                isSmallEnough(content) {
                    if (content.length > MAX_ARTICLE_CONTENT_LENGTH) {
                        throw new APIError(
                            `Article content should be ${Math.floor(
                                MAX_ARTICLE_CONTENT_LENGTH / 1000
                            )}k characters maximum.`,
                            429,
                            "VALIDATION_ERROR"
                        );
                    }
                },
            },
        },
        private: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        userId: {
            type: DataTypes.BIGINT,
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
        minsToRead: {
            // This will help in the recommendation system
            type: DataTypes.INTEGER,
            defaultValue: 5,
            validate: {
                min: 2,
            },
            allowNull: false,
        },
        readCounts: {
            // will help in recommendation system
            type: DataTypes.BIGINT,
            defaultValue: 0,
            validate: {
                min: 0,
            },
        },
        score: {
            // To reduce queries. Likes-Dislikes
            type: DataTypes.BIGINT,
            defaultValue: 0,
        },
        articleRank: {
            // Will help in recommendation system
            type: DataTypes.FLOAT,
            defaultValue: 0,
        },
        headline: {
            type: DataTypes.STRING(150),
            allowNull: true,
            validate: {
                isLargeEnough(headline) {
                    if (headline !== null && headline?.length < 50) {
                        throw new APIError(
                            "Article headline should be at least made of 50 chars",
                            400,
                            "VALIDATION_ERROR"
                        );
                    }
                },
                isSmallEnough(headline) {
                    if (
                        headline !== null &&
                        headline?.length > MAX_ARTICLE_CONTENT_LENGTH
                    ) {
                        throw new APIError(
                            `Article headline should be 150 characters maximum.`,
                            429,
                            "VALIDATION_ERROR"
                        );
                    }
                },
            },
        },
    },
    {
        sequelize,
        timestamp: true,
        // indexes: [
        //     {
        //         // There is two indexes here. in sequelize config file
        //         name: "rank_created_at_btree_index", // Getting posts for guests now is faster
        //         fields: [{ name: "rank", order: "DESC" }],
        //     },
        // ],
        hooks: {
            beforeCreate(article) {
                // Trim the content and title
                article.dataValues.title = article.dataValues.title.trim();
                // Normalize the header
                article.dataValues.title =
                    article.dataValues.title.toLowerCase();

                article.dataValues.content = article.dataValues.content.trim();

                // Normalize the headline if exists
                if (article.dataValues.headline)
                    article.dataValues.headline = article.dataValues.headline
                        .trim()
                        .toLowerCase();
            },
            beforeBulkUpdate(options) {
                // Trim the content, title and headline
                if (options.fields.includes("title"))
                    options.attributes.password.title =
                        options.attributes.password.title.trim().toLowerCase();

                if (options.fields.includes("content"))
                    options.attributes.password.content =
                        options.attributes.password.content
                            .trim()
                            .toLowerCase();

                if (
                    options.fields.includes("headline") &&
                    options.attributes.password.headline
                )
                    options.attributes.password.headline =
                        options.attributes.password.headline
                            .trim()
                            .toLowerCase();
            },
        },
    }
);

export default Article;
