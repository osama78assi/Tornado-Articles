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
                    if (typeof content === "string" && content.length < 10) {
                        throw new APIError(
                            "Article content should be at least made of 10 chars",
                            400,
                            "VALIDATION_ERROR"
                        );
                    }
                },
                isSmallEnough(content) {
                    if (
                        typeof content === "string" &&
                        content.length > MAX_ARTICLE_CONTENT_LENGTH
                    ) {
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
        categoryId: {
            type: DataTypes.BIGINT,
            references: {
                model: "Categories",
                key: "id",
            },
            allowNull: true,
            onDelete: "SET NULL" // The article may belongs to categry
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
                    if (typeof headline === "string" && headline?.length < 10) {
                        throw new APIError(
                            "Article headline should be at least made of 10 chars",
                            400,
                            "VALIDATION_ERROR"
                        );
                    }
                },
                isSmallEnough(headline) {
                    if (
                        typeof headline === "string" &&
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
            beforeValidate(article) {
                // Trim the content, title aand headline
                if (typeof article.dataValues.title === "string")
                    article.dataValues.title = article.dataValues.title.trim();
                if (typeof article.dataValues.content === "string")
                    article.dataValues.content =
                        article.dataValues.content.trim();
                if (typeof article.dataValues.headline === "string")
                    article.dataValues.headline =
                        article.dataValues.headline.trim();
            },
        },
    }
);

export default Article;
