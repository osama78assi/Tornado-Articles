import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";
import generateSnowFlakeId from "../../../config/snowFlake.js";
import APIError from "../../../util/APIError.js";

class Article extends Model {}

Article.init(
    {
        id: {
            type: DataTypes.BIGINT,
            defaultValue: () => generateSnowFlakeId(),
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                isLargeEnough(title) {
                    if (title.length < 5) {
                        throw new APIError(
                            "Article title should at least made of 5 chars",
                            400,
                            "SHORT_TITLE"
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
                isLargeEnough(title) {
                    if (title.length < 10) {
                        throw new APIError(
                            "Title content should be at least made of 10 chars",
                            400,
                            "SHORT_CONTENT"
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
        rank: {
            // Will help in recommendation system
            type: DataTypes.FLOAT,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        timestamp: true,
        indexes: [
            {
                // There is two indexes here. in sequelize config file
                name: "rank_created_at_btree_index", // Getting posts for guests now is faster
                fields: [{ name: "rank", order: "DESC" }],
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

export default Article;
